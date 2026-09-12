import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/check-video?videoId=<id>
 *
 * Consulta la YouTube oEmbed API (pública, sin API key).
 * - 200 + JSON  → video existe y es embebible
 * - 401         → video existe pero embedding está deshabilitado por el autor
 * - 404         → video eliminado, privado o ID inválido
 *
 * Retorna: { available: boolean, embeddable: boolean }
 */
export async function GET(req: NextRequest) {
  const videoId = req.nextUrl.searchParams.get('videoId');

  if (!videoId || !/^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
    return NextResponse.json({ available: false, embeddable: false }, { status: 400 });
  }

  const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;

  try {
    const res = await fetch(oembedUrl, {
      method: 'GET',
      // Timeout de 5 segundos para no bloquear el render
      signal: AbortSignal.timeout(5000),
    });

    if (res.ok) {
      // Video existe Y es embebible
      return NextResponse.json({ available: true, embeddable: true });
    }

    if (res.status === 401 || res.status === 403) {
      // Video existe pero el autor deshabilitó embedding
      // Podemos mostrar el link directo pero no iframe
      return NextResponse.json({ available: true, embeddable: false });
    }

    // 404 u otro → no existe / privado / eliminado
    return NextResponse.json({ available: false, embeddable: false });
  } catch {
    // Timeout o error de red → asumir no disponible para no bloquear
    return NextResponse.json({ available: false, embeddable: false });
  }
}
