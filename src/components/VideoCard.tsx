'use client';

import { useEffect, useState } from 'react';
import { ExternalLink, PlayCircle, AlertTriangle, Search, Loader2 } from 'lucide-react';
import { Video } from '@/types';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function extractVideoId(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname === 'youtu.be') return u.pathname.slice(1).split('?')[0] || null;
    if (u.pathname.startsWith('/shorts/')) return u.pathname.split('/shorts/')[1]?.split('?')[0] || null;
    if (u.pathname.startsWith('/embed/')) return u.pathname.split('/embed/')[1]?.split('?')[0] || null;
    const v = u.searchParams.get('v');
    if (v) return v;
  } catch { /* URL inválida */ }
  return null;
}

function searchUrl(title: string) {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(title)}`;
}

// ─── Estado del video ─────────────────────────────────────────────────────────
type VideoStatus =
  | { phase: 'checking' }
  | { phase: 'ok'; embeddable: boolean }   // video existe
  | { phase: 'unavailable' }               // eliminado / privado / 404
  | { phase: 'no-id' }                     // URL sin ID válido

// ─── Componente ───────────────────────────────────────────────────────────────

export default function VideoCard({ video }: { video: Video }) {
  const videoId = extractVideoId(video.url);
  const [status, setStatus] = useState<VideoStatus>(
    videoId ? { phase: 'checking' } : { phase: 'no-id' }
  );
  const [playing, setPlaying] = useState(false);

  const directUrl = videoId
    ? `https://www.youtube.com/watch?v=${videoId}`
    : video.url;
  const fallback = searchUrl(video.title);
  const thumbUrl = videoId
    ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
    : '';

  // Valida el video contra la oEmbed API (via nuestra ruta /api/check-video)
  useEffect(() => {
    if (!videoId) return;
    let cancelled = false;

    fetch(`/api/check-video?videoId=${videoId}`)
      .then((r) => r.json())
      .then((data: { available: boolean; embeddable: boolean }) => {
        if (cancelled) return;
        if (!data.available) {
          setStatus({ phase: 'unavailable' });
        } else {
          setStatus({ phase: 'ok', embeddable: data.embeddable });
        }
      })
      .catch(() => {
        if (!cancelled) setStatus({ phase: 'unavailable' });
      });

    return () => { cancelled = true; };
  }, [videoId]);

  // ── Render ────────────────────────────────────────────────────────────────

  const renderVisual = () => {
    // Cargando
    if (status.phase === 'checking') {
      return (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60">
          <Loader2 className="w-8 h-8 text-white/50 animate-spin" />
        </div>
      );
    }

    // Video no disponible o sin ID
    if (status.phase === 'unavailable' || status.phase === 'no-id') {
      return (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-6"
          style={{ background: 'color-mix(in srgb, var(--foreground) 8%, var(--background))' }}
        >
          <AlertTriangle className="w-8 h-8 opacity-30" />
          <p className="text-sm text-center opacity-50">
            Este video ya no está disponible.
          </p>
          <div className="flex gap-2 flex-wrap justify-center">
            {videoId && (
              <a
                href={directUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-white text-xs font-semibold px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
                style={{ background: 'var(--primary)' }}
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Intentar en YouTube
              </a>
            )}
            <a
              href={fallback}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-lg hover:opacity-80 transition-opacity"
              style={{ border: '1px solid var(--border)', color: 'var(--foreground)' }}
            >
              <Search className="w-3.5 h-3.5" />
              Buscar tema
            </a>
          </div>
        </div>
      );
    }

    // Video OK — embed deshabilitado por el autor
    if (status.phase === 'ok' && !status.embeddable) {
      return (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-6"
          style={{ background: 'color-mix(in srgb, var(--foreground) 8%, var(--background))' }}
        >
          {/* Thumbnail de fondo, desenfocado */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={thumbUrl} alt="" className="absolute inset-0 w-full h-full object-cover opacity-20 blur-sm" />
          <div className="relative z-10 flex flex-col items-center gap-3">
            <p className="text-sm text-center font-medium" style={{ color: 'var(--foreground)' }}>
              Este video no permite reproducción embebida.
            </p>
            <a
              href={directUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-white text-sm font-bold px-5 py-2.5 rounded-xl hover:opacity-90 transition-opacity shadow-lg"
              style={{ background: 'var(--primary)' }}
            >
              <ExternalLink className="w-4 h-4" />
              Ver en YouTube
            </a>
          </div>
        </div>
      );
    }

    // Video OK + embebible — thumbnail + botón play / iframe
    if (status.phase === 'ok' && status.embeddable) {
      if (playing && videoId) {
        return (
          <iframe
            className="absolute inset-0 w-full h-full"
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
            title={video.title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        );
      }

      return (
        <button
          onClick={() => setPlaying(true)}
          className="absolute inset-0 flex items-center justify-center group"
          aria-label={`Reproducir: ${video.title}`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={thumbUrl}
            alt={video.title}
            className="absolute inset-0 w-full h-full object-cover transition-opacity group-hover:opacity-90"
          />
          <div
            className="relative z-10 rounded-full p-4 transition-all group-hover:scale-110 shadow-xl"
            style={{ background: 'rgba(0,0,0,0.6)' }}
          >
            <PlayCircle className="w-12 h-12 text-white" />
          </div>
        </button>
      );
    }

    return null;
  };

  return (
    <div
      className="rounded-2xl overflow-hidden shadow-sm flex flex-col"
      style={{ border: '1px solid var(--border)' }}
    >
      {/* Área visual */}
      <div className="relative aspect-video w-full bg-black">
        {renderVisual()}
      </div>

      {/* Info + link */}
      <div
        className="px-4 py-3 flex items-start justify-between gap-3"
        style={{ background: 'var(--surface, var(--background))' }}
      >
        <div className="min-w-0">
          <h5 className="font-semibold text-sm line-clamp-2 leading-snug">{video.title}</h5>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-xs opacity-40">⏱ {video.durationMin} min</span>
            {status.phase === 'checking' && (
              <span className="text-xs opacity-30">Verificando...</span>
            )}
            {status.phase === 'unavailable' && (
              <span className="text-xs font-medium" style={{ color: '#ef4444' }}>No disponible</span>
            )}
            {status.phase === 'ok' && !status.embeddable && (
              <span className="text-xs opacity-40">Solo en YouTube</span>
            )}
          </div>
        </div>

        {/* Hipervínculo siempre visible */}
        <a
          href={status.phase === 'unavailable' || status.phase === 'no-id' ? fallback : directUrl}
          target="_blank"
          rel="noopener noreferrer"
          title={status.phase === 'unavailable' ? 'Buscar en YouTube' : 'Abrir en YouTube'}
          className="shrink-0 p-1.5 rounded-lg transition-all opacity-40 hover:opacity-100"
          style={{ color: 'var(--foreground)' }}
        >
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
}
