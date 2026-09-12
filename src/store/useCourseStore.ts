import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Course, StudentScore } from '../types';

interface CourseState {
  currentCourse: Course | null;
  studentProfile: StudentScore;
  setCourse: (course: Course) => void;
  /** Suma puntos al perfil. Se puede llamar varias veces por módulo (una por pregunta). */
  addPoints: (points: number) => void;
  /** Marca un módulo como completado (todos sus quizzes fueron respondidos). */
  markModuleComplete: (moduleId: string) => void;
  setUsername: (username: string) => void;
}

export const useCourseStore = create<CourseState>()(
  persist(
    (set) => ({
      currentCourse: null,
      studentProfile: {
        username: 'Estudiante',
        totalPoints: 0,
        completedQuizzes: {},
      },
      setCourse: (course) => set({ currentCourse: course }),
      addPoints: (points) =>
        set((state) => ({
          studentProfile: {
            ...state.studentProfile,
            totalPoints: state.studentProfile.totalPoints + points,
          },
        })),
      markModuleComplete: (moduleId) =>
        set((state) => {
          if (state.studentProfile.completedQuizzes[moduleId]) return state;
          return {
            studentProfile: {
              ...state.studentProfile,
              completedQuizzes: {
                ...state.studentProfile.completedQuizzes,
                [moduleId]: true,
              },
            },
          };
        }),
      setUsername: (username) =>
        set((state) => ({
          studentProfile: {
            ...state.studentProfile,
            username,
          },
        })),
    }),
    {
      name: 'course-storage',
    }
  )
);
