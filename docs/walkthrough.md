# Plataforma de Cursos Personalizados (Generative UI)

¡La plataforma está lista para utilizarse! Hemos completado exitosamente la implementación de la arquitectura que propusimos.

## Cambios Realizados

1. **Estructura Base & Next.js:** 
   - Se inicializó el proyecto en la carpeta `gamificacion-app` utilizando Next.js 14, TailwindCSS y TypeScript.
   - Instalamos Zustand para manejo de estados, `@google/genai` para la Inteligencia Artificial, y dependencias de utilidad como `lucide-react` para iconos.

2. **Integración con Gemini (Generative UI):**
   - En `src/actions/generateCourse.ts` implementamos un **Server Action** que conecta directamente con `gemini-2.5-flash`.
   - Utilizamos un **Structured Output (JSON Schema)** robusto para forzar a la IA a que devuelva un objeto estructurado (`ThemeConfig`, `Modules`, `Quizzes`, `Videos`).

3. **Tema Dinámico Inteligente:**
   - Se creó `ThemeProvider.tsx` que escucha las opciones estéticas sugeridas por la IA y modifica en tiempo real las variables CSS (`--primary`, `--secondary`, `--background`) y carga la **fuente de Google Fonts** solicitada de forma dinámica.

4. **Componentes Interactivos:**
   - **`CourseGenerator`**: Una interfaz fluida para ingresar el tópico.
   - **`CourseView`**: Renderiza módulos interactivos en Markdown, recursos externos e **iframes de videos** de YouTube de forma dinámica.
   - **`QuizManager`**: Lógica de evaluación para múltiple opción con retroalimentación inmediata.
   - **`Leaderboard`**: Panel gamificado que muestra puntajes, módulo completado, y permite al estudiante cambiar su alias. Se guarda automáticamente en el `localStorage` mediante Zustand.

## Cómo probar la aplicación

1. Abre una terminal dentro de la carpeta `gamificacion-app`.
2. Asegúrate de tener configurada tu clave de Google API. Crea un archivo `.env.local` en la raíz de `gamificacion-app` y agrega:
   ```env
   GEMINI_API_KEY=tu_clave_aqui
   ```
3. Ejecuta el servidor de desarrollo:
   ```bash
   npm run dev
   ```
4. Navega a `http://localhost:3000`. 
5. Ingresa un tema (ej: "Mecánica Cuántica" o "Historia del Arte Moderno") y observa cómo el sitio se adapta en color, tipografía y contenido mágicamente.
6. ¡Toma los quizzes para probar el sistema de puntos en tu Leaderboard!

> [!TIP]
> Dado que los colores se inyectan en todo el CSS del Tailwind (`var(--primary)`, etc.), el contraste puede variar según lo que genere Gemini, ¡pero eso es parte de la magia del Generative UI!
