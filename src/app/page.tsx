'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { generateCourseAction } from '@/actions/generateCourse';
import { useCourseStore } from '@/store/useCourseStore';
import { Sparkles, Loader2, BookOpen, ClipboardList, Trophy } from 'lucide-react';

const SUGGESTIONS = [
  'Física Cuántica',
  'Historia del Arte Moderno',
  'Machine Learning',
  'Cocina Italiana',
  'Filosofía Estoica',
  'Desarrollo Web con React',
];

export default function HomePage() {
  const router = useRouter();
  const setCourse = useCourseStore((state) => state.setCourse);
  const profile = useCourseStore((state) => state.studentProfile);

  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async (t: string) => {
    const value = t.trim();
    if (!value) return;
    setLoading(true);
    setError(null);
    try {
      const course = await generateCourseAction(value);
      setCourse(course);
      router.push('/curso');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al generar el curso.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleGenerate(topic);
  };

  return (
    <main className="min-h-screen flex flex-col">
      {/* ── Nav mínima ── */}
      <nav className="px-8 py-5 flex items-center justify-between border-b border-foreground/10">
        <span className="text-2xl font-black text-primary tracking-tight">LearnAI</span>
        <div className="flex items-center gap-2 text-sm text-foreground/60">
          <Trophy className="w-4 h-4 text-secondary" />
          <span className="font-semibold text-foreground">{profile.username}</span>
          <span className="font-bold text-secondary">{profile.totalPoints} XP</span>
        </div>
      </nav>

      {/* ── Hero ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-20 gap-10">
        {/* Título */}
        <div className="text-center space-y-4 max-w-2xl">
          <h1 className="text-6xl md:text-7xl font-black tracking-tight leading-none">
            <span className="text-transparent bg-clip-text bg-gradient-to-br from-primary to-secondary">
              Aprende
            </span>{' '}
            <span className="text-foreground">cualquier cosa.</span>
          </h1>
          <p className="text-lg md:text-xl text-foreground/60 font-medium">
            Escribe un tema y la IA genera un curso completo con contenido, videos y evaluación personalizada.
          </p>
        </div>

        {/* Buscador */}
        <form onSubmit={handleSubmit} className="w-full max-w-2xl">
          <div className="flex gap-3 p-2 bg-white border-2 border-primary/20 rounded-2xl shadow-lg focus-within:border-primary/50 transition-colors">
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="¿Qué quieres aprender hoy?"
              className="flex-1 px-4 py-3 bg-transparent text-foreground text-lg placeholder:text-foreground/40 focus:outline-none"
              disabled={loading}
              style={{ color: '#0f172a' }}
            />
            <button
              type="submit"
              disabled={loading || !topic.trim()}
              className="bg-primary hover:bg-primary/90 text-white font-bold px-6 py-3 rounded-xl transition-all flex items-center gap-2 disabled:opacity-50 shrink-0"
            >
              {loading ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Generando...</>
              ) : (
                <><Sparkles className="w-5 h-5" /> Generar Curso</>
              )}
            </button>
          </div>
          {error && <p className="mt-3 text-red-500 text-sm text-center">{error}</p>}
        </form>

        {/* Sugerencias */}
        {!loading && (
          <div className="flex flex-wrap gap-2 justify-center max-w-xl">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => { setTopic(s); handleGenerate(s); }}
                className="px-4 py-2 rounded-full border border-foreground/15 bg-foreground/5 hover:bg-primary/10 hover:border-primary/30 text-sm text-foreground/70 hover:text-primary transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center gap-3 text-foreground/50">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm">La IA está construyendo tu curso personalizado...</p>
          </div>
        )}

        {/* Features */}
        {!loading && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl w-full mt-4">
            {[
              { icon: BookOpen, label: 'Contenido estructurado', desc: 'Módulos, conceptos clave y lecturas generadas por IA' },
              { icon: Sparkles, label: 'Videos recomendados', desc: 'Videos de YouTube de menos de 15 min por módulo' },
              { icon: ClipboardList, label: 'Evaluación gamificada', desc: 'Quizzes con puntos XP y seguimiento de progreso' },
            ].map(({ icon: Icon, label, desc }) => (
              <div key={label} className="bg-foreground/5 border border-foreground/10 rounded-2xl p-5 space-y-2">
                <Icon className="w-6 h-6 text-primary" />
                <div className="font-semibold text-sm">{label}</div>
                <div className="text-xs text-foreground/55">{desc}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
