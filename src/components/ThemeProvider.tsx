'use client';

import { useCourseStore } from '@/store/useCourseStore';
import { useEffect, useState } from 'react';

// ─── Utilidades de color ──────────────────────────────────────────────────────

/** Parsea un HEX a { r, g, b }. Retorna null si es inválido. */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const clean = hex.replace('#', '').trim();
  if (clean.length !== 6) return null;
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  if (isNaN(r) || isNaN(g) || isNaN(b)) return null;
  return { r, g, b };
}

/** Luminancia relativa WCAG (0 = negro, 1 = blanco) */
function relativeLuminance(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0.5; // valor neutro si el HEX es inválido
  const { r, g, b } = rgb;
  const toLinear = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

/** Ratio de contraste WCAG entre dos colores (mínimo 1, máximo 21) */
function contrastRatio(hex1: string, hex2: string): number {
  const l1 = relativeLuminance(hex1);
  const l2 = relativeLuminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

/** Aclara u oscurece un HEX en un porcentaje (-100 a +100) */
function adjustBrightness(hex: string, pct: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  const factor = 1 + pct / 100;
  const r = clamp(rgb.r * factor);
  const g = clamp(rgb.g * factor);
  const b = clamp(rgb.b * factor);
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

/**
 * Garantiza que `colorHex` tenga al menos `minRatio` de contraste contra `bgHex`.
 * Si no, lo aclara o lo oscurece iterativamente hasta conseguirlo o agotar intentos.
 */
function ensureContrast(colorHex: string, bgHex: string, minRatio = 4.5): string {
  let color = colorHex;
  const bgLum = relativeLuminance(bgHex);
  // Si el fondo es oscuro, aclaramos el color; si es claro, lo oscurecemos
  const direction = bgLum < 0.5 ? 1 : -1;

  for (let step = 0; step < 20; step++) {
    if (contrastRatio(color, bgHex) >= minRatio) break;
    color = adjustBrightness(color, direction * 8);
  }
  return color;
}

// ─── Componente ──────────────────────────────────────────────────────────────

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const currentCourse = useCourseStore((state) => state.currentCourse);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!currentCourse?.themeConfig) return;

    let { primaryHex, secondaryHex, bgHex, fontFamily } = currentCourse.themeConfig;
    const root = document.documentElement;

    // 1. Foreground con contraste garantizado contra el fondo (mínimo WCAG AA = 4.5:1)
    const bgLum = relativeLuminance(bgHex);
    const foreground = bgLum < 0.5 ? '#f8fafc' : '#0f172a';
    root.style.setProperty('--foreground', foreground);

    // 2. Primary con contraste suficiente contra el fondo (usada en textos y botones)
    const safePrimary = ensureContrast(primaryHex, bgHex, 3.0);
    root.style.setProperty('--primary', safePrimary);

    // 3. Secondary con contraste suficiente
    const safeSecondary = ensureContrast(secondaryHex, bgHex, 3.0);
    root.style.setProperty('--secondary', safeSecondary);

    // 4. Fondo
    root.style.setProperty('--background', bgHex);

    // 5. Color de superficie (cards) — ligeramente diferente del fondo para dar profundidad
    const surfacePct = bgLum < 0.5 ? 12 : -5; // aclarar en oscuro, oscurecer en claro
    root.style.setProperty('--surface', adjustBrightness(bgHex, surfacePct));

    // 6. Borde sutil
    root.style.setProperty('--border', bgLum < 0.5 ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)');

    // 7. Google Font dinámica
    const linkId = 'dynamic-google-font';
    let link = document.getElementById(linkId) as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement('link');
      link.id = linkId;
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }
    const fontQuery = fontFamily.replace(/ /g, '+');
    link.href = `https://fonts.googleapis.com/css2?family=${fontQuery}:wght@400;500;600;700;800;900&display=swap`;
    root.style.setProperty('--font-sans', `"${fontFamily}", sans-serif`);
    document.body.style.fontFamily = `"${fontFamily}", sans-serif`;
  }, [currentCourse]);

  if (!mounted) return <div style={{ visibility: 'hidden' }}>{children}</div>;

  return <>{children}</>;
}
