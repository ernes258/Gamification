/**
 * Busca un video en YouTube Data API v3 dado un título de búsqueda.
 * Filtra por duración <= 15 min usando videoDuration=short (<=4min) primero,
 * y si no hay resultados, amplía a medium (4-20min).
 *
 * Retorna la URL real del video o null si no encuentra nada.
 */
export async function searchYouTubeVideo(
  query: string,
  apiKey: string
): Promise<{ url: string; title: string; durationMin: number } | null> {
  const base = 'https://www.googleapis.com/youtube/v3/search';

  // Intentamos primero videos cortos (≤4 min), luego medianos (4-20 min)
  const durations = ['short', 'medium'] as const;

  for (const duration of durations) {
    const params = new URLSearchParams({
      part: 'snippet',
      q: query,
      type: 'video',
      videoDuration: duration,
      maxResults: '3',
      relevanceLanguage: 'es',
      safeSearch: 'strict',
      key: apiKey,
    });

    try {
      const res = await fetch(`${base}?${params}`, {
        signal: AbortSignal.timeout(6000),
      });

      if (!res.ok) {
        const errBody = await res.text();
        console.error(`YouTube Search API error ${res.status}:`, errBody.slice(0, 300));
        return null;
      }

      const data = await res.json() as {
        items?: Array<{
          id: { videoId: string };
          snippet: { title: string };
        }>;
      };

      console.log(`YouTube search "${query}" (${duration}): ${data.items?.length ?? 0} results`);

      if (!data.items?.length) continue;

      // Tomamos el primer resultado
      const item = data.items[0];
      const videoId = item.id.videoId;
      const title = item.snippet.title;

      // Obtenemos la duración real del video via videos.list
      const durationMin = await getVideoDuration(videoId, apiKey);

      // Solo aceptamos si es ≤ 15 min
      if (durationMin !== null && durationMin <= 15) {
        return {
          url: `https://www.youtube.com/watch?v=${videoId}`,
          title,
          durationMin,
        };
      }

      // Si el primero no cumple, probamos el siguiente
      for (const fallbackItem of data.items.slice(1)) {
        const fId = fallbackItem.id.videoId;
        const fDur = await getVideoDuration(fId, apiKey);
        if (fDur !== null && fDur <= 15) {
          return {
            url: `https://www.youtube.com/watch?v=${fId}`,
            title: fallbackItem.snippet.title,
            durationMin: fDur,
          };
        }
      }
    } catch (e) {
      console.error('YouTube search error:', e);
      return null;
    }
  }

  return null;
}

/** Obtiene la duración de un video en minutos usando videos.list */
async function getVideoDuration(videoId: string, apiKey: string): Promise<number | null> {
  const params = new URLSearchParams({
    part: 'contentDetails',
    id: videoId,
    key: apiKey,
  });

  try {
    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?${params}`,
      { signal: AbortSignal.timeout(5000) }
    );

    if (!res.ok) return null;

    const data = await res.json() as {
      items?: Array<{ contentDetails: { duration: string } }>;
    };

    const iso = data.items?.[0]?.contentDetails?.duration;
    if (!iso) return null;

    return parseDuration(iso);
  } catch {
    return null;
  }
}

/**
 * Parsea duración ISO 8601 (PT1H2M3S) a minutos.
 * Ejemplos: PT5M30S → 5.5, PT1H → 60, PT45S → 0.75
 */
function parseDuration(iso: string): number {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  const hours = parseInt(match[1] ?? '0');
  const minutes = parseInt(match[2] ?? '0');
  const seconds = parseInt(match[3] ?? '0');
  return hours * 60 + minutes + seconds / 60;
}
