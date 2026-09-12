'use client';

import { useCourseStore } from '@/store/useCourseStore';
import { Trophy, User, Medal } from 'lucide-react';
import { useState, useEffect } from 'react';

interface LeaderboardProps {
  /** Modo compacto: una línea horizontal para el header */
  compact?: boolean;
}

export default function Leaderboard({ compact = false }: LeaderboardProps) {
  const profile = useCourseStore((state) => state.studentProfile);
  const setUsername = useCourseStore((state) => state.setUsername);
  const [mounted, setMounted] = useState(false);
  const [editing, setEditing] = useState(false);
  const [nameInput, setNameInput] = useState('');

  useEffect(() => {
    setMounted(true);
    setNameInput(profile.username);
  }, [profile.username]);

  if (!mounted) return null;

  const handleSave = () => {
    if (nameInput.trim()) setUsername(nameInput.trim());
    setEditing(false);
  };

  /* ── Modo compacto (header) ── */
  if (compact) {
    return (
      <div className="flex items-center gap-3 bg-secondary/10 border border-secondary/25 rounded-xl px-4 py-2 shrink-0">
        {/* Avatar */}
        <div className="bg-secondary/20 p-1.5 rounded-lg">
          <User className="w-4 h-4 text-secondary" />
        </div>

        {/* Nombre editable */}
        {editing ? (
          <div className="flex items-center gap-1.5">
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              onBlur={handleSave}
              autoFocus
              className="w-24 px-2 py-0.5 text-sm bg-background border border-secondary rounded focus:outline-none"
            />
          </div>
        ) : (
          <button
            onClick={() => setEditing(true)}
            className="text-sm font-semibold hover:text-secondary transition-colors"
            title="Editar nombre"
          >
            {profile.username}
          </button>
        )}

        {/* Divisor */}
        <div className="w-px h-5 bg-secondary/20" />

        {/* Puntos */}
        <div className="flex items-center gap-1.5">
          <Medal className="w-4 h-4 text-secondary" />
          <span className="text-sm font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
            {profile.totalPoints}
          </span>
          <span className="text-xs text-foreground/40 font-medium">XP</span>
        </div>

        {/* Módulos completados */}
        <div className="hidden sm:flex items-center gap-1.5">
          <Trophy className="w-4 h-4 text-secondary/60" />
          <span className="text-xs text-foreground/50 font-medium">
            {Object.keys(profile.completedQuizzes).length} módulos
          </span>
        </div>
      </div>
    );
  }

  /* ── Modo normal (panel completo) ── */
  return (
    <div className="bg-secondary/10 border border-secondary/30 rounded-2xl p-6 flex flex-col gap-4 shadow-lg backdrop-blur-md">
      <div className="flex items-center gap-3 text-secondary border-b border-secondary/20 pb-4">
        <Trophy className="w-8 h-8" />
        <h2 className="text-2xl font-bold">Tu Perfil Estelar</h2>
      </div>

      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-3">
          <div className="bg-secondary/20 p-3 rounded-full">
            <User className="w-6 h-6 text-secondary" />
          </div>
          <div>
            {editing ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="px-2 py-1 bg-background border border-secondary rounded text-sm w-32 focus:outline-none"
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                />
                <button onClick={handleSave} className="text-xs bg-secondary text-white px-2 py-1 rounded">Ok</button>
              </div>
            ) : (
              <div
                className="font-bold text-lg cursor-pointer hover:underline decoration-secondary/50"
                onClick={() => setEditing(true)}
                title="Haz clic para cambiar tu nombre"
              >
                {profile.username}
              </div>
            )}
            <div className="text-xs text-foreground/60">Estudiante</div>
          </div>
        </div>

        <div className="text-right">
          <div className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary flex items-center gap-1 justify-end">
            {profile.totalPoints} <Medal className="w-6 h-6 text-secondary" />
          </div>
          <div className="text-xs uppercase tracking-widest text-foreground/60 font-semibold">Puntos XP</div>
        </div>
      </div>

      <div className="mt-2">
        <div className="text-sm mb-1 font-medium">
          Módulos Completados: {Object.keys(profile.completedQuizzes).length}
        </div>
        <div className="w-full bg-secondary/20 rounded-full h-2">
          <div
            className="bg-secondary h-2 rounded-full transition-all duration-1000"
            style={{ width: `${Math.min(100, Object.keys(profile.completedQuizzes).length * 33.3)}%` }}
          />
        </div>
      </div>
    </div>
  );
}
