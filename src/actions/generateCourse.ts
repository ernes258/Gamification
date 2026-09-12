'use server';

import { GoogleGenAI, Type, Schema } from '@google/genai';
import { Course, Video } from '../types';
import { isTechTopic } from '../lib/techDetector';
import { searchYouTubeVideo } from '../lib/youtubeSearch';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// ── Schema de celda de código ────────────────────────────────────────────────
const codeCellSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    label: { type: Type.STRING, description: "Título corto de la celda, ej: 'Instalación', 'Ejemplo básico'" },
    explanation: { type: Type.STRING, description: "Explicación en texto de lo que hace el código (1-3 oraciones)" },
    code: { type: Type.STRING, description: "El código completo, listo para ejecutar" },
    language: { type: Type.STRING, description: "Lenguaje: python, javascript, typescript, bash o sql" },
    output: { type: Type.STRING, description: "Salida esperada del código al ejecutarlo (opcional pero muy útil)" },
  },
  required: ['label', 'explanation', 'code', 'language'],
};

const notebookSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: "Título del notebook, ej: 'Tutorial práctico: Variables y Funciones'" },
    description: { type: Type.STRING, description: "Descripción breve del notebook y qué aprenderá el estudiante" },
    cells: {
      type: Type.ARRAY,
      description: "3 a 5 celdas de código que muestren conceptos progresivos del módulo",
      items: codeCellSchema,
    },
  },
  required: ['title', 'description', 'cells'],
};

// ── Schema del módulo (con notebook opcional) ────────────────────────────────
function buildModuleSchema(includNotebook: boolean): Schema {
  const props: Schema['properties'] = {
    id: { type: Type.STRING, description: "ID único del módulo, ej. 'mod-1'" },
    title: { type: Type.STRING, description: "Título del módulo" },
    summary: { type: Type.STRING, description: "Breve resumen o introducción motivadora" },
    keyConcepts: {
      type: Type.ARRAY,
      description: "Lista de 3 a 5 conceptos clave",
      items: {
        type: Type.OBJECT,
        properties: {
          term: { type: Type.STRING, description: "Nombre del concepto" },
          definition: { type: Type.STRING, description: "Definición clara y concisa" },
        },
        required: ['term', 'definition'],
      },
    },
    contentBlocks: {
      type: Type.ARRAY,
      description: "Párrafos de lectura. Cada elemento es un párrafo completo.",
      items: { type: Type.STRING },
    },
    links: {
      type: Type.ARRAY,
      description: "2-3 URLs de recursos externos de calidad",
      items: { type: Type.STRING },
    },
    videos: {
      type: Type.ARRAY,
      description: "1-2 videos de YouTube <= 15 min. Solo incluye el título de búsqueda, NO la URL.",
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: "Título descriptivo para buscar en YouTube, ej: 'Introducción a Python para principiantes'" },
          durationMin: { type: Type.INTEGER, description: "Duración estimada en minutos (<= 15)" },
        },
        required: ['title', 'durationMin'],
      },
    },
    quizzes: {
      type: Type.ARRAY,
      description: "3 a 5 preguntas de opción múltiple",
      items: {
        type: Type.OBJECT,
        properties: {
          question: { type: Type.STRING },
          options: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: { text: { type: Type.STRING } },
              required: ['text'],
            },
          },
          correctIndex: { type: Type.INTEGER, description: "Índice 0-based de la opción correcta" },
          points: { type: Type.INTEGER, description: "Puntos al responder correctamente" },
        },
        required: ['question', 'options', 'correctIndex', 'points'],
      },
    },
  };

  const required = ['id', 'title', 'summary', 'keyConcepts', 'contentBlocks', 'links', 'videos', 'quizzes'];

  if (includNotebook) {
    props.notebook = {
      ...notebookSchema,
      description: "Notebook de ejemplo con código ejecutable para este módulo",
    };
    required.push('notebook');
  }

  return { type: Type.OBJECT, properties: props, required };
}

function buildCourseSchema(isTech: boolean): Schema {
  return {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING, description: "El título del curso generado" },
      isTech: { type: Type.BOOLEAN, description: "true si el tema es de tecnología o programación" },
      themeConfig: {
        type: Type.OBJECT,
        properties: {
          primaryHex: { type: Type.STRING, description: "Color primario HEX" },
          secondaryHex: { type: Type.STRING, description: "Color secundario HEX" },
          bgHex: { type: Type.STRING, description: "Color de fondo HEX" },
          fontFamily: { type: Type.STRING, description: "Nombre de Google Font" },
        },
        required: ['primaryHex', 'secondaryHex', 'bgHex', 'fontFamily'],
      },
      modules: {
        type: Type.ARRAY,
        description: "3 módulos de aprendizaje",
        items: buildModuleSchema(isTech),
      },
    },
    required: ['title', 'isTech', 'themeConfig', 'modules'],
  };
}

// ── Action principal ──────────────────────────────────────────────────────────

export async function generateCourseAction(topic: string): Promise<Course> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('Missing GEMINI_API_KEY');
  }

  const isTech = isTechTopic(topic);

  const notebookInstructions = isTech ? `
  NOTEBOOKS DE CÓDIGO (solo para cursos técnicos):
  - Incluye un notebook con 3-5 celdas de código por módulo, mostrando conceptos progresivos.
  - El código debe ser COMPLETO y ejecutable (no pseudocódigo).
  - Incluye el output esperado cuando sea posible para que el estudiante pueda verificar.
  - Las celdas deben ir de más simple a más complejo: instalación → uso básico → ejemplo avanzado.
  - Usa el lenguaje más apropiado para el tema (Python para ML/data, JS para web, SQL para bases de datos, etc.).
  ` : '';

  const prompt = `Actúa como un experto educador y diseñador UI. Crea un curso interactivo sobre: "${topic}".

  ESTRUCTURA DEL CURSO (3 módulos):
  - Resúmenes, 3-5 conceptos clave (para flashcards) y bloques de lectura detallados por módulo.
  - Estrictamente 3-5 preguntas de quiz por módulo con opciones claras.
  - Para los videos: proporciona SOLO el título de búsqueda descriptivo (NO URLs). La URL se resolverá automáticamente. Ej: "Introducción a Machine Learning en Python - tutorial".
  - 2-3 enlaces externos de calidad por módulo.
  - isTech debe ser ${isTech ? 'true' : 'false'}.
  ${notebookInstructions}

  DISEÑO ESTÉTICO (themeConfig):
  - Paleta que refleje la emoción y temática del curso. Puede ser clara, oscura, vibrante o pastel.
  - VARIEDAD: no uses siempre fondos oscuros. Arte/cocina/naturaleza → fondos claros o cálidos. Tecnología/espacio → puedes usar oscuros.
  - CONTRASTE: primary y secondary deben tener ratio WCAG >= 3:1 contra el fondo.
  - Google Fonts apropiadas: 'Playfair Display' para arte, 'Space Grotesk' para tecnología, 'Lora' para humanidades.
  - Paletas de referencia:
    * Ciencias: bgHex=#f0f9ff, primaryHex=#0369a1, secondaryHex=#7c3aed
    * Arte: bgHex=#fdf4e3, primaryHex=#92400e, secondaryHex=#be185d
    * Tecnología: bgHex=#0f172a, primaryHex=#38bdf8, secondaryHex=#a78bfa
    * Naturaleza: bgHex=#f0fdf4, primaryHex=#166534, secondaryHex=#0891b2`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: buildCourseSchema(isTech),
      temperature: 0.7,
    },
  });

  if (!response.text) throw new Error('Respuesta vacía de Gemini');

  const course = JSON.parse(response.text) as Course;

  // ── Resolver videos con YouTube Data API v3 ──────────────────────────────
  const youtubeKey = process.env.YOUTUBE_API;

  if (youtubeKey) {
    // Buscamos todos los videos en paralelo para no bloquear
    const resolveModuleVideos = async (videos: Video[]): Promise<Video[]> => {
      return Promise.all(
        videos.map(async (vid) => {
          // Construimos una query más específica combinando el título con el tema del curso
          const query = `${vid.title} ${topic}`;
          const result = await searchYouTubeVideo(query, youtubeKey);
          if (result) {
            return { ...vid, url: result.url, title: result.title, durationMin: Math.round(result.durationMin) };
          }
          // Si no encontró nada, dejamos url vacía — VideoCard mostrará fallback de búsqueda
          return { ...vid, url: `https://www.youtube.com/results?search_query=${encodeURIComponent(vid.title)}` };
        })
      );
    };

    course.modules = await Promise.all(
      course.modules.map(async (mod) => ({
        ...mod,
        videos: await resolveModuleVideos(mod.videos),
      }))
    );
  }

  return course;
}
