'use client';

import { useEffect, useRef, useState } from 'react';
import { Notebook } from '@/types';
import { Terminal, Copy, Check, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import hljs from 'highlight.js/lib/core';
import python from 'highlight.js/lib/languages/python';
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
import bash from 'highlight.js/lib/languages/bash';
import sql from 'highlight.js/lib/languages/sql';

// Registrar solo los lenguajes que usamos (tree-shaking)
hljs.registerLanguage('python', python);
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('bash', bash);
hljs.registerLanguage('shell', bash);
hljs.registerLanguage('sql', sql);

// ── Helpers ──────────────────────────────────────────────────────────────────

function highlight(code: string, lang: string): string {
  try {
    return hljs.highlight(code, { language: lang, ignoreIllegals: true }).value;
  } catch {
    return hljs.highlightAuto(code).value;
  }
}

/** Genera un link a Google Colab con el código del notebook codificado en URL */
function buildColabUrl(cells: Notebook['cells']): string {
  // Construye un JSON mínimo de notebook para abrir en Colab via gist no es viable
  // sin backend, así que abrimos Colab en blanco con los snippets listos para copiar
  return 'https://colab.research.google.com/#create=true';
}

// ── Celda individual ─────────────────────────────────────────────────────────

function CodeCell({
  cell,
  index,
}: {
  cell: Notebook['cells'][0];
  index: number;
}) {
  const [copied, setCopied] = useState(false);
  const [showOutput, setShowOutput] = useState(false);

  const highlighted = highlight(cell.code, cell.language);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(cell.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ border: '1px solid var(--border)' }}
    >
      {/* Cabecera de la celda */}
      <div
        className="flex items-center justify-between px-4 py-2.5 gap-3"
        style={{
          background: 'color-mix(in srgb, var(--primary) 10%, var(--background))',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div className="flex items-center gap-2 min-w-0">
          {/* Número de celda estilo Jupyter */}
          <span
            className="text-xs font-mono font-bold px-2 py-0.5 rounded shrink-0"
            style={{
              background: 'color-mix(in srgb, var(--primary) 20%, transparent)',
              color: 'var(--primary)',
            }}
          >
            [{index + 1}]
          </span>
          <span className="font-semibold text-sm truncate">{cell.label}</span>
          <span
            className="text-xs px-2 py-0.5 rounded-full font-mono shrink-0 opacity-60"
            style={{
              background: 'color-mix(in srgb, var(--foreground) 10%, transparent)',
            }}
          >
            {cell.language}
          </span>
        </div>
        <button
          onClick={handleCopy}
          className="shrink-0 flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-all"
          style={{
            background: copied
              ? 'color-mix(in srgb, #22c55e 20%, transparent)'
              : 'color-mix(in srgb, var(--foreground) 8%, transparent)',
            color: copied ? '#22c55e' : 'var(--foreground)',
          }}
        >
          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? 'Copiado' : 'Copiar'}
        </button>
      </div>

      {/* Explicación */}
      {cell.explanation && (
        <div
          className="px-4 py-3 text-sm leading-relaxed"
          style={{
            background: 'color-mix(in srgb, var(--foreground) 3%, var(--background))',
            borderBottom: '1px solid var(--border)',
            opacity: 0.8,
          }}
        >
          {cell.explanation}
        </div>
      )}

      {/* Bloque de código */}
      <div
        className="relative overflow-x-auto"
        style={{ background: '#1e1e2e' }} // fondo oscuro fijo para el código
      >
        <pre className="p-4 text-sm leading-relaxed font-mono overflow-x-auto">
          <code
            className="hljs"
            dangerouslySetInnerHTML={{ __html: highlighted }}
          />
        </pre>
      </div>

      {/* Output colapsable */}
      {cell.output && (
        <div style={{ borderTop: '1px solid var(--border)' }}>
          <button
            onClick={() => setShowOutput(!showOutput)}
            className="w-full flex items-center justify-between px-4 py-2 text-xs font-semibold transition-colors"
            style={{
              background: 'color-mix(in srgb, var(--foreground) 4%, var(--background))',
              color: 'var(--foreground)',
              opacity: 0.7,
            }}
          >
            <span>Output</span>
            {showOutput ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
          {showOutput && (
            <pre
              className="px-4 py-3 text-xs font-mono whitespace-pre-wrap overflow-x-auto"
              style={{
                background: '#111827',
                color: '#86efac', // verde terminal
                borderTop: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              {cell.output}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────

export default function NotebookViewer({ notebook }: { notebook: Notebook }) {
  // Carga el CSS de highlight.js una sola vez
  useEffect(() => {
    const id = 'hljs-theme';
    if (!document.getElementById(id)) {
      const link = document.createElement('link');
      link.id = id;
      link.rel = 'stylesheet';
      // Tema Tokyo Night, compatible con fondos oscuros del bloque de código
      link.href = 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/tokyo-night-dark.min.css';
      document.head.appendChild(link);
    }
  }, []);

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ border: '1px solid var(--border)' }}
    >
      {/* Header del notebook */}
      <div
        className="px-6 py-4 flex items-center justify-between gap-4"
        style={{
          background: 'color-mix(in srgb, var(--primary) 12%, var(--surface, var(--background)))',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="p-2 rounded-xl shrink-0"
            style={{ background: 'color-mix(in srgb, var(--primary) 20%, transparent)' }}
          >
            <Terminal className="w-5 h-5" style={{ color: 'var(--primary)' }} />
          </div>
          <div className="min-w-0">
            <div
              className="text-xs font-semibold uppercase tracking-widest mb-0.5 opacity-50"
            >
              Notebook de Ejemplo
            </div>
            <h4 className="font-bold text-base truncate">{notebook.title}</h4>
          </div>
        </div>

        {/* Link a Google Colab */}
        <a
          href={buildColabUrl(notebook.cells)}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-xl transition-opacity hover:opacity-80"
          style={{ background: '#F9AB00', color: '#1a1a1a' }}
          title="Abrir Google Colab para practicar"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          Abrir en Colab
        </a>
      </div>

      {/* Descripción */}
      <div
        className="px-6 py-4 text-sm leading-relaxed"
        style={{
          background: 'var(--surface, var(--background))',
          borderBottom: '1px solid var(--border)',
          opacity: 0.75,
        }}
      >
        {notebook.description}
      </div>

      {/* Celdas */}
      <div
        className="p-5 space-y-4"
        style={{ background: 'var(--surface, var(--background))' }}
      >
        {notebook.cells.map((cell, i) => (
          <CodeCell key={i} cell={cell} index={i} />
        ))}
      </div>
    </div>
  );
}
