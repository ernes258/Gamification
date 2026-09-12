'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCourseStore } from '@/store/useCourseStore';
import CourseView from '@/components/CourseView';
import { ClipboardList, Home, Trophy, Sparkles } from 'lucide-react';

export default function CursoPage() {
  const router = useRouter();
  const course = useCourseStore((state) => state.currentCourse);
  const profile = useCourseStore((state) => state.studentProfile);
  const completedCount = Object.keys(profile.completedQuizzes).length;
  const totalModules = course?.modules.length ?? 0;

  // Si no hay curso, redirigir al home
  useEffect(() => {
    if (!course) router.replace('/');
  }, [course, router]);

  if (!course) return null;

  return (
    <div className="min-h-screen flex flex-col">
      {/* ── Header ── */}
      <header className="sticky top-0 z-30 bg-background/90 backdrop-blur-md border-b border-foreground/10">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center gap-4">
          {/* Home */}
          <Link href="/" className="text-xl font-black text-primary tracking-tight shrink-0">
            LearnAI
          </Link>

          {/* Título del curso */}
          <div className="flex-1 min-w-0">
            <p className="text-xs text-foreground/40 uppercase tracking-widest font-semibold">Curso</p>
            <h1 className="text-sm font-bold truncate">{course.title}</h1>
          </div>

          {/* Nav páginas */}
          <nav className="flex items-center gap-1 shrink-0">
            <span className="px-4 py-2 rounded-lg bg-primary/10 text-primary text-sm font-semibold flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" /> Contenido
            </span>
            <Link
              href="/evaluacion"
              className="px-4 py-2 rounded-lg text-foreground/60 hover:bg-foreground/5 text-sm font-semibold flex items-center gap-1.5 transition-colors"
            >
              <ClipboardList className="w-4 h-4" />
              Evaluación
              {totalModules > 0 && (
                <span className="bg-secondary/15 text-secondary text-xs font-bold px-1.5 py-0.5 rounded-full">
                  {completedCount}/{totalModules}
                </span>
              )}
            </Link>
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

      {/* ── Contenido ── */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-12">
        <CourseView />

        {/* CTA a evaluación */}
        <div className="mt-20 flex justify-center">
          <Link
            href="/evaluacion"
            className="inline-flex items-center gap-3 bg-gradient-to-r from-primary to-secondary text-white font-bold px-8 py-4 rounded-2xl shadow-lg hover:opacity-90 transition-opacity text-lg"
          >
            <ClipboardList className="w-5 h-5" />
            Ir a la Evaluación
          </Link>
        </div>
      </main>
    </div>
  );
}
