'use client';

import { useCourseStore } from '@/store/useCourseStore';
import QuizManager from './QuizManager';
import { ClipboardList, Lock } from 'lucide-react';

export default function EvaluationView() {
  const course = useCourseStore((state) => state.currentCourse);
  const completedQuizzes = useCourseStore((state) => state.studentProfile.completedQuizzes);

  if (!course) return null;

  const totalModules = course.modules.length;
  const completedCount = Object.keys(completedQuizzes).length;
  const allDone = completedCount >= totalModules;

  return (
    <section className="w-full max-w-4xl mx-auto space-y-10">
      {/* Header de la sección */}
      <div className="text-center space-y-3 py-8 border-b border-primary/20">
        <div className="inline-flex items-center gap-3 bg-primary/10 border border-primary/20 rounded-full px-5 py-2 text-primary text-sm font-semibold uppercase tracking-widest">
          <ClipboardList className="w-4 h-4" />
          Evaluación
        </div>
        <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
          Pon a prueba tu conocimiento
        </h2>
        <p className="text-foreground/60 max-w-lg mx-auto">
          Completa los quizzes de cada módulo para ganar puntos XP. Solo puedes responder cada módulo una vez.
        </p>

        {/* Barra de progreso global */}
        <div className="max-w-sm mx-auto mt-4">
          <div className="flex justify-between text-xs text-foreground/50 mb-1">
            <span>{completedCount} de {totalModules} módulos completados</span>
            <span>{Math.round((completedCount / totalModules) * 100)}%</span>
          </div>
          <div className="w-full bg-secondary/20 rounded-full h-2.5">
            <div
              className="bg-gradient-to-r from-primary to-secondary h-2.5 rounded-full transition-all duration-700"
              style={{ width: `${(completedCount / totalModules) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Badge de felicitación */}
      {allDone && (
        <div className="bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/30 rounded-2xl p-6 text-center space-y-2">
          <div className="text-4xl">🎉</div>
          <div className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
            ¡Curso Completado!
          </div>
          <p className="text-foreground/70 text-sm">Has respondido todos los módulos. Revisa tus puntos en el dashboard.</p>
        </div>
      )}

      {/* Quizzes por módulo */}
      <div className="space-y-10">
        {course.modules.map((mod, index) => {
          const isCompleted = !!completedQuizzes[mod.id];
          return (
            <div
              key={mod.id}
              className="rounded-3xl p-8 transition-all duration-300"
              style={{
                background: isCompleted
                  ? 'color-mix(in srgb, #22c55e 6%, var(--background))'
                  : 'var(--surface, var(--background))',
                border: isCompleted
                  ? '1px solid color-mix(in srgb, #22c55e 30%, transparent)'
                  : '1px solid var(--border)',
              }}
            >
              {/* Cabecera del módulo en evaluación */}
              <div className="flex items-center gap-4 mb-6">
                <div className={`w-10 h-10 flex items-center justify-center rounded-xl font-black text-lg shrink-0 ${
                  isCompleted ? 'bg-green-500/20 text-green-400' : 'bg-primary/20 text-primary'
                }`}>
                  {isCompleted ? '✓' : index + 1}
                </div>
                <div className="flex-1">
                  <div className="text-xs font-semibold uppercase tracking-widest text-foreground/40 mb-0.5">
                    Módulo {index + 1}
                  </div>
                  <h3 className="text-xl font-bold">{mod.title}</h3>
                </div>
                {isCompleted && (
                  <span className="text-xs bg-green-500/20 text-green-400 border border-green-500/30 px-3 py-1 rounded-full font-semibold">
                    Completado
                  </span>
                )}
              </div>

              <QuizManager moduleId={mod.id} quizzes={mod.quizzes} />
            </div>
          );
        })}
      </div>

      {/* Mensaje si no hay curso todavía */}
      {course.modules.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-20 text-foreground/40">
          <Lock className="w-10 h-10" />
          <p>Genera un curso para ver la evaluación.</p>
        </div>
      )}
    </section>
  );
}
