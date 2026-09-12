/**
 * Categorías que habilitan la generación de notebooks con código.
 *
 * Solo se generan notebooks para:
 *  - Inteligencia Artificial / Machine Learning
 *  - Programación y desarrollo de software
 *  - Ciencias puras (matemáticas, física, química, biología, estadística…)
 *  - Ciencias aplicadas (ingeniería, electrónica, robótica, biotecnología…)
 *
 * Quedan EXCLUIDOS: arte, historia, cocina, negocios, idiomas, filosofía,
 * psicología, marketing, economía general, deportes, etc.
 */

// ── Inteligencia Artificial & Machine Learning ────────────────────────────────
const AI_ML = [
  'inteligencia artificial', 'artificial intelligence',
  'machine learning', 'aprendizaje automático',
  'deep learning', 'aprendizaje profundo',
  'redes neuronales', 'neural networks',
  'nlp', 'procesamiento de lenguaje natural', 'natural language processing',
  'computer vision', 'visión por computadora',
  'reinforcement learning', 'aprendizaje por refuerzo',
  'llm', 'large language model', 'modelo de lenguaje',
  'generative ai', 'ia generativa',
  'tensorflow', 'pytorch', 'keras', 'scikit', 'hugging face',
  'transformers', 'bert', 'gpt',
  'data science', 'ciencia de datos',
  'data engineering', 'ingeniería de datos',
  'análisis de datos', 'data analysis',
  'pandas', 'numpy', 'matplotlib', 'seaborn',
];

// ── Programación y desarrollo de software ────────────────────────────────────
const PROGRAMMING = [
  // lenguajes
  'python', 'javascript', 'typescript', 'java', 'c++', 'c#', 'c sharp',
  'rust', 'go', 'golang', 'kotlin', 'swift', 'ruby', 'php', 'scala',
  'r language', 'lenguaje r', 'matlab', 'fortran', 'assembly', 'ensamblador',
  // web
  'react', 'next.js', 'nextjs', 'vue', 'angular', 'svelte',
  'node', 'express', 'django', 'fastapi', 'flask', 'rails',
  'html', 'css', 'tailwind', 'bootstrap',
  'desarrollo web', 'web development',
  'frontend', 'backend', 'fullstack', 'full stack',
  // bases de datos
  'sql', 'nosql', 'mongodb', 'postgres', 'postgresql', 'mysql', 'redis',
  'bases de datos', 'database',
  // infraestructura / devops
  'devops', 'docker', 'kubernetes', 'aws', 'azure', 'google cloud',
  'cloud computing', 'computación en la nube',
  'git', 'github', 'linux', 'bash', 'shell scripting',
  'ci/cd', 'microservicios', 'microservices',
  'api', 'rest', 'graphql', 'websockets',
  // conceptos generales
  'algoritmos', 'algorithms',
  'estructuras de datos', 'data structures',
  'programación', 'programming', 'coding',
  'blockchain', 'ciberseguridad', 'cybersecurity',
  'testing', 'pruebas de software',
  'patrones de diseño', 'design patterns',
];

// ── Ciencias puras ────────────────────────────────────────────────────────────
const PURE_SCIENCES = [
  // matemáticas
  'matemáticas', 'mathematics', 'math',
  'álgebra', 'algebra', 'cálculo', 'calculus',
  'estadística', 'statistics', 'probabilidad', 'probability',
  'geometría', 'trigonometría', 'análisis matemático',
  'ecuaciones diferenciales', 'differential equations',
  'álgebra lineal', 'linear algebra',
  'teoría de números', 'number theory',
  'topología', 'topology', 'teoría de grafos', 'graph theory',
  // física
  'física', 'physics',
  'mecánica clásica', 'classical mechanics',
  'termodinámica', 'thermodynamics',
  'electromagnetismo', 'electrodynamics',
  'física cuántica', 'quantum physics', 'mecánica cuántica', 'quantum mechanics',
  'relatividad', 'relativity',
  'óptica', 'optics', 'acústica', 'acoustics',
  'física nuclear', 'nuclear physics',
  'astrofísica', 'astrophysics',
  // química
  'química', 'chemistry',
  'química orgánica', 'organic chemistry',
  'química inorgánica', 'inorganic chemistry',
  'fisicoquímica', 'physical chemistry',
  'bioquímica', 'biochemistry',
  'termodinámica química',
  // biología
  'biología', 'biology',
  'genética', 'genetics',
  'biología molecular', 'molecular biology',
  'microbiología', 'microbiology',
  'neurociencia', 'neuroscience',
  'ecología', 'ecology',
  'evolución', 'evolution',
  'biología celular', 'cell biology',
  // ciencias de la tierra y espacio
  'geología', 'geology',
  'astronomía', 'astronomy',
  'cosmología', 'cosmology',
  'meteorología', 'meteorology',
  'oceanografía', 'oceanography',
];

// ── Ciencias aplicadas e ingeniería ──────────────────────────────────────────
const APPLIED_SCIENCES = [
  'ingeniería', 'engineering',
  'ingeniería civil', 'civil engineering',
  'ingeniería mecánica', 'mechanical engineering',
  'ingeniería eléctrica', 'electrical engineering',
  'ingeniería electrónica', 'electronics engineering',
  'ingeniería de sistemas', 'systems engineering',
  'ingeniería biomédica', 'biomedical engineering',
  'ingeniería química', 'chemical engineering',
  'ingeniería ambiental', 'environmental engineering',
  'robótica', 'robotics',
  'automatización', 'automation',
  'electrónica', 'electronics',
  'circuitos', 'circuits',
  'señales y sistemas', 'signals and systems',
  'telecomunicaciones', 'telecommunications',
  'biotecnología', 'biotechnology',
  'nanotecnología', 'nanotechnology',
  'energías renovables', 'renewable energy',
  'termodinámica aplicada',
  'mecánica de fluidos', 'fluid mechanics',
  'resistencia de materiales', 'materials science',
  'ciencias de la computación', 'computer science',
  'informática',
];

// ── Unificado ─────────────────────────────────────────────────────────────────
const NOTEBOOK_KEYWORDS = [
  ...AI_ML,
  ...PROGRAMMING,
  ...PURE_SCIENCES,
  ...APPLIED_SCIENCES,
];

/**
 * Retorna true si el tema debe incluir un notebook con código.
 * Solo aplica a IA/ML, programación, y ciencias puras/aplicadas.
 */
export function isTechTopic(topic: string): boolean {
  const lower = topic.toLowerCase();
  return NOTEBOOK_KEYWORDS.some((kw) => lower.includes(kw));
}
