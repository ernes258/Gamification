# LearnAI — Plataforma de Cursos Generados por IA

Una aplicación web que genera cursos interactivos y personalizados usando **Gemini AI** de Google. El usuario escribe un tema, y la IA construye un curso completo con contenido estructurado, videos reales de YouTube, quizzes gamificados y (para temas técnicos) notebooks de código ejecutable.

---

## Características

- **Generative UI** — colores, tipografía y estética del sitio se adaptan al tema del curso en tiempo real
- **Contenido estructurado** — resúmenes, conceptos clave (flashcards), bloques de lectura por módulo
- **Videos reales** — búsqueda automática en YouTube Data API para garantizar videos existentes ≤ 15 min
- **Notebooks de código** — para temas de IA, programación y ciencias, incluye celdas de código con syntax highlighting, output esperado y botón "Abrir en Colab"
- **Evaluación gamificada** — quizzes de opción múltiple con puntos XP y barra de progreso
- **Persistencia local** — el perfil del estudiante y los puntos se guardan en `localStorage`
- **Tres páginas separadas** — Home (búsqueda), Curso (contenido), Evaluación (quizzes)

---

## Stack

| Capa | Tecnología |
|---|---|
| Framework | Next.js 14 (App Router) |
| Lenguaje | TypeScript |
| Estilos | Tailwind CSS + CSS Variables dinámicas |
| Estado global | Zustand + `persist` middleware |
| IA generativa | Google Gemini 2.5 Flash (`@google/genai`) |
| Búsqueda de videos | YouTube Data API v3 |
| Syntax highlighting | highlight.js (tema Tokyo Night) |
| Íconos | lucide-react |

---

## Requisitos previos

- Node.js 18 o superior
- Cuenta de Google para obtener las API keys

---

## Credenciales necesarias

La aplicación requiere dos claves de API. Ambas son gratuitas con cuota generosa.

### 1. Gemini API Key

Usada para generar el contenido del curso con IA.

1. Ve a [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
2. Inicia sesión con tu cuenta de Google
3. Haz clic en **Create API key**
4. Selecciona un proyecto de Google Cloud existente o crea uno nuevo
5. Copia la clave generada

> **Cuota gratuita:** Gemini 2.5 Flash tiene un tier gratuito generoso (requests por minuto y por día). Suficiente para desarrollo y uso personal.

---

### 2. YouTube Data API v3 Key

Usada para buscar y verificar videos reales en YouTube.

1. Ve a [console.cloud.google.com](https://console.cloud.google.com)
2. Selecciona el mismo proyecto donde creaste la Gemini key (o crea uno nuevo)
3. En el menú lateral ve a **APIs y servicios → Biblioteca**
4. Busca `YouTube Data API v3` y haz clic en **Habilitar**
5. Ve a **APIs y servicios → Credenciales**
6. Haz clic en **+ Crear credenciales → Clave de API**
7. Copia la clave generada

**Recomendado — restringir la key:**
- Haz clic en la key recién creada
- En "Restricciones de API" selecciona **YouTube Data API v3**
- Guarda los cambios

> **Cuota gratuita:** 10,000 unidades por día. Cada búsqueda consume ~100 unidades → ~100 búsquedas de video gratuitas diarias.

---

## Instalación y configuración

```bash
# 1. Clonar o descargar el repositorio
cd gamificacion-app

# 2. Instalar dependencias
npm install

# 3. Crear el archivo de variables de entorno
cp .env.example .env.local
```

Edita `.env.local` con tus claves:

```env
GEMINI_API_KEY=tu_gemini_key_aqui
YOUTUBE_API=tu_youtube_key_aqui
```

```bash
# 4. Iniciar el servidor de desarrollo
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

---

## Estructura del proyecto

```
src/
├── app/
│   ├── page.tsx              # Home — buscador y hero
│   ├── curso/page.tsx        # Página de contenido del curso
│   ├── evaluacion/page.tsx   # Página de quizzes
│   ├── api/
│   │   └── check-video/      # Route handler: verifica disponibilidad de videos en YouTube
│   └── globals.css           # Variables CSS globales (tema dinámico)
├── actions/
│   └── generateCourse.ts     # Server Action: llama a Gemini y resuelve videos con YouTube
├── components/
│   ├── CourseGenerator.tsx   # Input de búsqueda (modo normal y compacto)
│   ├── CourseView.tsx        # Vista de módulos con contenido
│   ├── EvaluationView.tsx    # Vista de quizzes agrupados por módulo
│   ├── Leaderboard.tsx       # Dashboard de puntos XP (modo normal y compacto)
│   ├── NotebookViewer.tsx    # Visor de notebooks de código estilo Jupyter
│   ├── ThemeProvider.tsx     # Aplica el tema generado por IA con control de contraste WCAG
│   ├── VideoCard.tsx         # Card de video con validación oEmbed y fallback
│   └── QuizManager.tsx       # Lógica de preguntas y respuestas
├── lib/
│   ├── techDetector.ts       # Detecta si el tema es IA/programación/ciencias → habilita notebook
│   └── youtubeSearch.ts      # Busca videos reales en YouTube Data API v3
├── store/
│   └── useCourseStore.ts     # Estado global con Zustand (curso, perfil, puntos)
└── types/
    └── index.ts              # Tipos TypeScript: Course, Module, Quiz, Notebook, etc.
```

---

## Cómo funciona

1. El usuario escribe un tema en el buscador del home
2. Un **Server Action** envía el tema a Gemini con un JSON Schema estricto
3. Gemini responde con la estructura completa del curso (contenido, conceptos, quizzes, themeConfig)
4. En paralelo, se buscan los videos en **YouTube Data API v3** usando los títulos sugeridos por la IA, verificando que existan y duren ≤ 15 min
5. El **ThemeProvider** aplica los colores generados al DOM, calculando contraste WCAG para garantizar legibilidad
6. Si el tema es de IA, programación o ciencias, cada módulo incluye un **notebook** con celdas de código progresivas
7. El usuario navega entre las páginas de Contenido y Evaluación; los puntos se persisten en `localStorage`

---

## Temas que generan notebooks de código

Los notebooks se generan automáticamente para:

- **IA / ML:** machine learning, deep learning, NLP, computer vision, PyTorch, TensorFlow, etc.
- **Programación:** Python, JavaScript, React, SQL, Docker, algoritmos, estructuras de datos, etc.
- **Ciencias puras:** matemáticas, física, química, biología, estadística, astronomía, etc.
- **Ciencias aplicadas:** ingeniería (civil, mecánica, eléctrica, biomédica), robótica, electrónica, biotecnología, etc.

Para otros temas (arte, historia, cocina, filosofía, etc.) no se genera notebook.

---

## Scripts disponibles

```bash
npm run dev      # Servidor de desarrollo en localhost:3000
npm run build    # Build de producción
npm run start    # Servidor de producción (requiere build previo)
npm run lint     # Linter ESLint
```
