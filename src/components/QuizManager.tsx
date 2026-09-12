'use client';

import { useState } from 'react';
import { Quiz } from '@/types';
import { useCourseStore } from '@/store/useCourseStore';
import { CheckCircle, XCircle, HelpCircle } from 'lucide-react';

interface SingleQuizProps {
  quiz: Quiz;
  index: number;
  onAnswered: (correct: boolean, points: number) => void;
}

function SingleQuiz({ quiz, index, onAnswered }: SingleQuizProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (selected === null || submitted) return;
    setSubmitted(true);
    onAnswered(selected === quiz.correctIndex, quiz.points);
  };

  return (
    <div className="bg-background border border-primary/20 p-5 rounded-xl shadow-sm">
      <div className="flex items-start gap-3 mb-4">
        <HelpCircle className="text-primary w-5 h-5 mt-0.5 shrink-0" />
        <div>
          <span className="text-xs font-semibold uppercase tracking-widest text-primary/70 block mb-1">
            Pregunta {index + 1} · {quiz.points} pts
          </span>
          <p className="text-base font-medium">{quiz.question}</p>
        </div>
      </div>

      <div className="flex flex-col gap-2 pl-8">
        {quiz.options.map((opt, i) => {
          const isSelected = selected === i;
          const isCorrect = i === quiz.correctIndex;

          let cls = 'text-left px-4 py-2.5 rounded-lg border text-sm transition-all ';
          if (submitted) {
            if (isCorrect)
              cls += 'bg-green-500/20 border-green-500 text-green-400 font-semibold';
            else if (isSelected)
              cls += 'bg-red-500/20 border-red-500 text-red-400';
            else
              cls += 'border-foreground/10 opacity-40';
          } else {
            cls += isSelected
              ? 'bg-primary/20 border-primary font-semibold'
              : 'border-primary/20 hover:bg-primary/10 bg-background';
          }

          return (
            <button
              key={i}
              onClick={() => !submitted && setSelected(i)}
              disabled={submitted}
              className={cls}
            >
              {opt.text}
            </button>
          );
        })}
      </div>

      {!submitted && (
        <div className="mt-4 pl-8">
          <button
            onClick={handleSubmit}
            disabled={selected === null}
            className="bg-secondary hover:bg-secondary/90 text-white px-5 py-2 rounded-lg text-sm font-semibold disabled:opacity-40 transition-colors"
          >
            Enviar Respuesta
          </button>
        </div>
      )}

      {submitted && (
        <div className={`mt-3 pl-8 flex items-center gap-2 text-sm ${selected === quiz.correctIndex ? 'text-green-400' : 'text-red-400'}`}>
          {selected === quiz.correctIndex
            ? <><CheckCircle className="w-4 h-4 shrink-0" /><span>¡Correcto! +{quiz.points} pts</span></>
            : <><XCircle className="w-4 h-4 shrink-0" /><span>Incorrecto. La respuesta correcta está marcada en verde.</span></>
          }
        </div>
      )}
    </div>
  );
}

export default function QuizManager({ moduleId, quizzes }: { moduleId: string; quizzes: Quiz[] }) {
  const addPoints = useCourseStore((state) => state.addPoints);
  const markModuleComplete = useCourseStore((state) => state.markModuleComplete);
  const completed = useCourseStore((state) => state.studentProfile.completedQuizzes[moduleId]);

  // Rastreo local de cuántas preguntas se han respondido (para marcar el módulo al terminar)
  const [answeredCount, setAnsweredCount] = useState(0);

  if (!quizzes || quizzes.length === 0) return null;

  const handleAnswered = (correct: boolean, points: number) => {
    if (correct) addPoints(points);

    const next = answeredCount + 1;
    setAnsweredCount(next);
    if (next >= quizzes.length) {
      markModuleComplete(moduleId);
    }
  };

  if (completed) {
    return (
      <div className="bg-green-500/10 border border-green-500/40 p-5 rounded-xl flex items-center gap-3">
        <CheckCircle className="text-green-400 w-6 h-6 shrink-0" />
        <div>
          <div className="font-bold text-green-400">Módulo Completado</div>
          <div className="text-sm text-foreground/70">
            Ya respondiste todas las preguntas de este módulo.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-primary flex items-center gap-2">
        <HelpCircle className="w-5 h-5" /> Quiz del Módulo
      </h3>
      {quizzes.map((quiz, i) => (
        <SingleQuiz
          key={i}
          quiz={quiz}
          index={i}
          onAnswered={handleAnswered}
        />
      ))}
    </div>
  );
}
