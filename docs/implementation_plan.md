# Plataforma de Cursos Personalizados (Generative UI)

Arquitectura y plan de implementación para la plataforma de generación de cursos con Inteligencia Artificial utilizando Gemini y Next.js.

## Descripción del Proyecto

Una aplicación web que permite a los usuarios introducir un tema de interés para que, mediante la API de Gemini, se genere un curso completo, incluyendo:
- **Configuración Estética:** Colores y tipografía inyectados dinámicamente vía variables CSS.
- **Contenido del Curso:** Módulos con resúmenes, conceptos clave, bloques de lectura, enlaces, y videos de YouTube (≤ 15 min).
- **Evaluación (Quizzes):** Preguntas de múltiple opción por módulo con retroalimentación inmediata.
- **Gamificación:** Sistema de puntos XP y perfil de estudiante persistido en LocalStorage.

## Decisiones Tomadas

- **Gestor de paquetes:** `npm`
- **Modelo de IA:** `gemini-2.5-flash` con Structured Outputs (JSON Schema estricto)
- **Videos:** Gemini provee las URLs de YouTube basándose en su conocimiento. Los iframes se renderizan en `CourseView`. Los enlaces podrían no ser exactos en todos los casos dado que la IA los aproxima.
- **Ubicación del proyecto:** `gamificacion-app/` dentro de la carpeta raíz.

## Stack Tecnológico

| Capa | Tecnología |
|---|---|
| Framework | Next.js 14 (App Router) |
| Lenguaje | TypeScript |
| Estilos | Tailwind CSS + Variables CSS dinámicas |
| Estado global | Zustand con middleware `persist` (LocalStorage) |
| IA | `@google/genai` — Gemini 2.5 Flash |
| Íconos | `lucide-react` |
| Fuentes dinámicas | Google Fonts (cargadas en runtime por el ThemeProvider) |

---

## Implementación

### 1. Inicialización y Configuración ✅

- Proyecto Next.js 14 inicializado con App Router, Tailwind CSS y TypeScript en `gamificacion-app/`.
- Dependencias instaladas: `zustand`, `@google/genai`, `lucide-react`.
- Variable de entorno requerida: `GEMINI_API_KEY` en `.env.local`.

### 2. Definición de Schemas (Tipos) ✅

Archivo: `src/types/index.ts`

Tipos implementados con TypeScript:

```
ThemeConfig     → { primaryHex, secondaryHex, bgHex, fontFamily }
QuizOption      → { text }
Quiz            → { question, options, correctIndex, points }
Video           → { title, url, durationMin }
KeyConcept      → { term, definition }
Module          → { id, title, summary, keyConcepts, contentBlocks, links, videos, quizzes }
Course          → { title, themeConfig, modules }
StudentScore    → { username, totalPoints, completedQuizzes }
```

### 3. Backend (Server Action) ✅

Archivo: `src/actions/generateCourse.ts`

- Server Action de Next.js que instancia el SDK `@google/genai`.
- Prompt en español con instrucciones precisas: 3 módulos, 3-5 quizzes cada uno, videos ≤ 15 min.
- JSON Schema completo pasado como `responseSchema` para garantizar la estructura del `Course` devuelto.
- `responseMimeType: 'application/json'` y `temperature: 0.7` para respuestas estructuradas y creativas.

### 4. Estado y Persistencia ✅

Archivo: `src/store/useCourseStore.ts`

Implementado con Zustand + middleware `persist`:
- `currentCourse` — el curso generado por Gemini.
- `studentProfile` — nombre, puntos XP, y mapa de quizzes completados.
- `setCourse(course)` — guarda el curso generado.
- `updateScore(moduleId, points)` — suma puntos solo si el módulo no fue completado previamente (idempotente).
- `setUsername(username)` — permite cambiar el alias del estudiante.
- Persistido automáticamente en `localStorage` bajo la clave `course-storage`.

### 5. Frontend & Generative UI ✅

#### `ThemeProvider.tsx`
Wrapper cliente que escucha `currentCourse.themeConfig` y aplica en tiempo real:
- Variables CSS: `--primary`, `--secondary`, `--background`, `--font-sans`
- Carga dinámica de Google Fonts vía un `<link>` inyectado en el `<head>`.
- Evita hydration mismatch con un guard de `mounted`.

#### `CourseGenerator.tsx`
- Formulario con input de texto y botón de envío.
- Llama a `generateCourseAction(topic)` y guarda el resultado en Zustand.
- Estado de carga con spinner (`Loader2`) y manejo de errores.

#### `CourseView.tsx`
- Renderiza el curso completo: título, módulos, conceptos clave, bloques de contenido.
- Iframes de YouTube embebidos con conversión automática de URLs (`watch?v=` → `/embed/`).
- Links de recursos externos con apertura en nueva pestaña.
- Pasa cada módulo al `QuizManager`.

#### `QuizManager.tsx`
- Recibe `moduleId` y el array de `quizzes` del módulo.
- Maneja selección, envío, y retroalimentación visual (verde/rojo por opción).
- Detecta si el módulo ya fue completado (desde Zustand) y muestra estado de éxito.
- Permite reintentar si la respuesta es incorrecta (sin penalización de puntos duplicados).

#### `Leaderboard.tsx`
- Muestra nombre editable, puntos XP acumulados, y barra de progreso de módulos.
- El nombre se guarda en Zustand (`persist` → LocalStorage).
- Guard de `mounted` para evitar errores de SSR con `localStorage`.

#### `app/page.tsx`
- Layout principal con sidebar sticky para el Leaderboard.
- Hero con título en gradiente dinámico visible solo si no hay curso activo.
- Animaciones de entrada (`animate-in fade-in`) al aparecer el `CourseView`.
- Fondos decorativos con blur que usan los colores dinámicos (`bg-primary/20`, `bg-secondary/20`).

---

## Verificación

### Pasos para correr el proyecto

```bash
# 1. Entrar a la carpeta del proyecto
cd gamificacion-app

# 2. Crear el archivo de entorno (si no existe)
echo GEMINI_API_KEY=tu_clave_aqui > .env.local

# 3. Instalar dependencias (si es la primera vez)
npm install

# 4. Iniciar el servidor de desarrollo
npm run dev
```

Navegar a `http://localhost:3000`.

### Checklist de Verificación Manual

- [ ] Ingresar un tema (ej. "Introducción a la Astronomía") y generar el curso.
- [ ] Confirmar que los colores del sitio y la tipografía cambian según `themeConfig`.
- [ ] Completar un quiz con respuesta incorrecta → verificar que no se otorgan puntos.
- [ ] Completar un quiz con respuesta correcta → verificar que los puntos se suman en el Leaderboard.
- [ ] Refrescar la página → confirmar que los puntos y el nombre del Leaderboard persisten.
- [ ] Verificar que un quiz ya completado muestra el estado "Quiz Completado" y no permite volver a sumar puntos.

### Notas de Calidad

- Los colores generados por la IA pueden producir contrastes variables. Es parte del diseño de Generative UI.
- Las URLs de YouTube son aproximadas por Gemini y pueden no corresponder a videos reales en todos los casos.
- El JSON Schema estricto minimiza respuestas malformadas, pero errores de red o cuota de API pueden ocurrir.
