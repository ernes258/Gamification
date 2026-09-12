'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCourseStore } from '@/store/useCourseStore';
import EvaluationView from '@/components/EvaluationView';
import { BookOpen, Home, Trophy, ClipboardList, Sparkles } from 'lucide-react';

export default function EvaluacionPage() {
  const router = useRouter();
  const course = useCourseStore((state) => state.currentCourse);
  const profile = useCourseStore((state) => state.studentProfile);
  const [mounted, setMounted] = useState(false);

  const completedCount = Object.keys(profile.completedQuizzes).length;
  const totalModules = course?.modules.length ?? 0;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !course) router.replace('/');
  }, [course, router, mounted]);

  if (!mounted || !course) return null;

  return (
    <div className="min-h-screen flex flex-col">
      {/* ── Header ── */}
      <header className="sticky top-0 z-30 bg-background/90 backdrop-blur-md border-b border-foreground/10">
        <div className="max-w-4xl mx-auto px-6 py-3 flex items-center gap-4">
          {/* Logo */}
          <Link href="/" className="text-xl font-black text-primary tracking-tight shrink-0">
            LearnAI
          </Link>

          {/* Título */}
          <div className="flex-1 min-w-0">
            <p className="text-xs text-foreground/40 uppercase tracking-widest font-semibold">Evaluación</p>
            <h1 className="text-sm font-bold truncate">{course.title}</h1>
          </div>

          {/* Nav páginas */}
          <nav className="flex items-center gap-1 shrink-0">
            <Link
              href="/curso"
              className="px-4 py-2 rounded-lg text-foreground/60 hover:bg-foreground/5 text-sm font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Sparkles className="w-4 h-4" /> Contenido
            </Link>
            <span className="px-4 py-2 rounded-lg bg-secondary/10 text-secondary text-sm font-semibold flex items-center gap-1.5">
              <ClipboardList className="w-4 h-4" />
              Evaluación
              {totalModules > 0 && (
                <span className="bg-secondary/20 text-secondary text-xs font-bold px-1.5 py-0.5 rounded-full">
                  {completedCount}/{totalModules}
                </span>
              )}
            </span>
            <Link href="/" className="px-3 py-2 rounded-lg text-foreground/40 hover:text-foreground/70 hover:bg-foreground/5 transition-colors">
              <Home className="w-4 h-4" />
            </Link>
          </nav>

          {/* XP badge */}
          <div className="hidden sm:flex items-center gap-1.5 bg-secondary/10 border border-secondary/20 rounded-lg px-3 py-1.5 shrink-0">
            <Trophy className="w-4 h-4 text-secondary" />
            <span className="text-sm font-bold text-secondary">{profile.totalPoints} XP</span>
          </div>
        </div>
      </header>

      {/* ── Evaluación ── */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-12">
        <EvaluationView />

        {/* CTA volver al contenido */}
        <div className="mt-16 flex justify-center">
          <Link
            href="/curso"
            className="inline-flex items-center gap-2 border-2 border-primary/30 text-primary font-semibold px-6 py-3 rounded-xl hover:bg-primary/5 transition-colors"
          >
            <BookOpen className="w-4 h-4" />
            Volver al Contenido
          </Link>
        </div>
      </main>
    </div>
  );
}
