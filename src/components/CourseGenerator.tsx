'use client';

import { useState } from 'react';
import { generateCourseAction } from '@/actions/generateCourse';
import { useCourseStore } from '@/store/useCourseStore';
import { Loader2, Sparkles } from 'lucide-react';

interface CourseGeneratorProps {
  /** Modo compacto: una sola línea horizontal para el header */
  compact?: boolean;
}

export default function CourseGenerator({ compact = false }: CourseGeneratorProps) {
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const setCourse = useCourseStore((state) => state.setCourse);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const course = await generateCourseAction(topic);
      setCourse(course);
    } catch (err: unknown) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Error al generar el curso.');
    } finally {
      setLoading(false);
    }
  };

  /* ── Modo compacto (header) ── */
  if (compact) {
    return (
      <form onSubmit={handleSubmit} className="flex items-center gap-2 w-full">
        <div className="relative flex-1">
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="¿Qué quieres aprender hoy? Ej: Física Cuántica, React JS..."
            className="w-full pl-4 pr-4 py-2.5 rounded-xl border border-primary/25 bg-background/60 text-foreground text-sm placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
            disabled={loading}
          />
        </div>
        <button
          type="submit"
          disabled={loading || !topic.trim()}
          className="shrink-0 bg-primary hover:bg-primary/90 text-white font-semibold py-2.5 px-5 rounded-xl transition-colors flex items-center gap-2 text-sm disabled:opacity-50 whitespace-nowrap"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Generando...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Generar
            </>
          )}
        </button>
        {error && (
          <p className="absolute top-full left-0 mt-1 text-red-400 text-xs">{error}</p>
        )}
      </form>
    );
  }

  /* ── Modo normal (página de inicio) ── */
  return (
    <div className="bg-background/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-primary/20 max-w-lg w-full">
      <h2 className="text-3xl font-bold mb-6 text-primary">¿Qué quieres aprender hoy?</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Ej: Física Cuántica, React JS, Cocina Italiana..."
          className="px-4 py-3 rounded-lg border border-primary/30 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary w-full"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !topic.trim()}
          className="bg-primary hover:bg-primary/90 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Generando Curso (IA)...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Generar Curso Personalizado
            </>
          )}
        </button>
      </form>
      {error && <p className="text-red-500 mt-4 text-sm">{error}</p>}
    </div>
  );
}
