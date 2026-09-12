'use client';

import { useCourseStore } from '@/store/useCourseStore';
import VideoCard from './VideoCard';
import NotebookViewer from './NotebookViewer';
import { Link as LinkIcon, BookOpen, Layers, Lightbulb, PlayCircle } from 'lucide-react';

export default function CourseView() {
  const course = useCourseStore((state) => state.currentCourse);

  if (!course) return null;

  return (
    <section className="w-full max-w-5xl mx-auto space-y-12">
      {/* Título del curso */}
      <div className="text-center space-y-4 py-8" style={{ borderBottom: '1px solid var(--border)' }}>
        <div
          className="inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold uppercase tracking-widest"
          style={{ background: 'color-mix(in srgb, var(--secondary) 12%, transparent)', color: 'var(--secondary)' }}
        >
          <BookOpen className="w-4 h-4" />
          Contenido del Curso
        </div>
        <h2 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
          {course.title}
        </h2>
        <p className="max-w-2xl mx-auto" style={{ color: 'var(--foreground)', opacity: 0.6 }}>
          Estudia cada módulo antes de pasar a la evaluación.
        </p>
      </div>

      {/* Módulos */}
      <div className="space-y-14">
        {course.modules.map((mod, index) => (
          <div
            key={mod.id}
            className="rounded-3xl p-8 md:p-10 shadow-lg relative overflow-hidden"
            style={{
              background: 'var(--surface, var(--background))',
              border: '1px solid var(--border)',
            }}
          >
            {/* Decorativo */}
            <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
              <Layers className="w-48 h-48" style={{ color: 'var(--secondary)' }} />
            </div>

            <div className="relative z-10">
              {/* Encabezado del módulo */}
              <div className="flex items-center gap-4 mb-5">
                <div
                  className="w-12 h-12 flex items-center justify-center rounded-2xl font-black text-2xl shrink-0"
                  style={{ background: 'color-mix(in srgb, var(--primary) 15%, transparent)', color: 'var(--primary)' }}
                >
                  {index + 1}
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-widest opacity-40">
                    Módulo {index + 1}
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold">{mod.title}</h3>
                </div>
              </div>

              {/* Resumen */}
              <p className="text-lg leading-relaxed mb-8 pl-16" style={{ color: 'var(--foreground)', opacity: 0.8 }}>
                {mod.summary}
              </p>

              {/* Conceptos Clave */}
              {mod.keyConcepts?.length > 0 && (
                <div className="mb-10">
                  <h4
                    className="text-base font-semibold mb-4 flex items-center gap-2 pb-2"
                    style={{ borderBottom: '1px solid var(--border)' }}
                  >
                    <Lightbulb className="w-5 h-5" style={{ color: 'var(--primary)' }} />
                    Conceptos Clave
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {mod.keyConcepts.map((kc, kIdx) => (
                      <div
                        key={kIdx}
                        className="rounded-xl p-4"
                        style={{
                          background: 'color-mix(in srgb, var(--primary) 8%, transparent)',
                          border: '1px solid color-mix(in srgb, var(--primary) 20%, transparent)',
                        }}
                      >
                        <div className="font-bold text-sm mb-1" style={{ color: 'var(--primary)' }}>{kc.term}</div>
                        <div className="text-sm opacity-75">{kc.definition}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Bloques de Contenido */}
              {mod.contentBlocks?.length > 0 && (
                <div className="mb-10 space-y-4 leading-relaxed text-base opacity-90">
                  {mod.contentBlocks.map((block, bIdx) => (
                    <p key={bIdx}>{block}</p>
                  ))}
                </div>
              )}

              {/* Videos */}
              {mod.videos?.length > 0 && (
                <div className="mb-10">
                  <h4
                    className="text-base font-semibold mb-4 flex items-center gap-2 pb-2"
                    style={{ borderBottom: '1px solid var(--border)' }}
                  >
                    <PlayCircle className="w-5 h-5" style={{ color: 'var(--primary)' }} />
                    Videos Recomendados (≤15 min)
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {mod.videos.map((vid, vIdx) => (
                      <VideoCard key={vIdx} video={vid} />
                    ))}
                  </div>
                </div>
              )}

              {/* Links */}
              {mod.links?.length > 0 && (
                <div className="mb-10">
                  <h4
                    className="text-base font-semibold mb-4 flex items-center gap-2 pb-2"
                    style={{ borderBottom: '1px solid var(--border)' }}
                  >
                    <LinkIcon className="w-5 h-5" style={{ color: 'var(--secondary)' }} />
                    Recursos Externos
                  </h4>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {mod.links.map((link, lIdx) => (
                      <li key={lIdx}>
                        <a
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 p-3 rounded-xl transition-colors group"
                          style={{
                            background: 'color-mix(in srgb, var(--secondary) 6%, transparent)',
                            border: '1px solid color-mix(in srgb, var(--secondary) 20%, transparent)',
                          }}
                        >
                          <LinkIcon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" style={{ color: 'var(--secondary)' }} />
                          <span className="truncate text-sm">{link}</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Notebook de código — solo para módulos tech */}
              {mod.notebook && (
                <div>
                  <h4
                    className="text-base font-semibold mb-4 flex items-center gap-2 pb-2"
                    style={{ borderBottom: '1px solid var(--border)' }}
                  >
                    <span style={{ color: 'var(--primary)' }}>{'</>'}</span>
                    Notebook de Código
                  </h4>
                  <NotebookViewer notebook={mod.notebook} />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
