export interface ThemeConfig {
  primaryHex: string;
  secondaryHex: string;
  bgHex: string;
  fontFamily: string;
}

export interface QuizOption {
  text: string;
}

export interface Quiz {
  question: string;
  options: QuizOption[];
  correctIndex: number;
  points: number;
}

export interface Video {
  title: string;
  url: string;
  durationMin: number;
}

export interface KeyConcept {
  term: string;
  definition: string;
}

/** Una celda de código estilo notebook */
export interface CodeCell {
  /** Etiqueta de la celda, ej: "Instalación", "Ejemplo básico", "Visualización" */
  label: string;
  /** Explicación en texto plano de lo que hace el código */
  explanation: string;
  /** El código en sí */
  code: string;
  /** Lenguaje de programación: python | javascript | typescript | bash | sql */
  language: string;
  /** Salida esperada del código (opcional) */
  output?: string;
}

/** Notebook de ejemplo incluido en módulos de cursos tecnológicos */
export interface Notebook {
  title: string;
  description: string;
  cells: CodeCell[];
}

export interface Module {
  id: string;
  title: string;
  summary: string;
  keyConcepts: KeyConcept[];
  contentBlocks: string[];
  links: string[];
  videos: Video[];
  quizzes: Quiz[];
  /** Solo presente en cursos de tecnología/programación */
  notebook?: Notebook;
}

export interface Course {
  title: string;
  themeConfig: ThemeConfig;
  modules: Module[];
  /** true si el tema es de tecnología/programación/ciencias de datos */
  isTech: boolean;
}

export interface StudentScore {
  username: string;
  totalPoints: number;
  completedQuizzes: Record<string, boolean>;
}
