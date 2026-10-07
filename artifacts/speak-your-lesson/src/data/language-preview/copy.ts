export const languages = [
  { code: "en", name: "English" },
  { code: "es", name: "Español" },
] as const;
export type Language = (typeof languages)[number]["code"];
export const isLanguage = (value: unknown): value is Language =>
  languages.some((language) => language.code === value);

export const copy = {
  en: {
    preview: "Language preview",
    languageMenuLabel: "App and teacher language",
    studentLanguageLabel: "Student materials language",
    studentLanguageHelp: "Choose the language students will see.",
    back: "Back to Scaffold",
    eyebrow: "Your planning workspace",
    title: "Your teaching. Your language.",
    intro:
      "Read guidance in the language that works for you. Choose student materials separately.",
    settings: "Language preferences",
    app: "App language",
    guidance: "Teacher guidance",
    materials: "Student materials",
    remembered: "Your language choices are remembered on this browser.",
    notice:
      "Prepared example · Draft translations for review. The header menu changes the app and teacher guidance; set student materials separately. Live generation is not connected.",
    context: "The classroom moment",
    grade: "Grade 4 · Reading",
    example: "General example · Not aligned to an approved curriculum profile",
    target: "Learning goal",
    evidence: "What you observed",
    teacher: "For you",
    student: "For your students",
    teacherSubtitle: "A suggested teaching move",
    studentSubtitle: "Ready to read together",
    compare: "Show English alongside",
    original: "English original",
    why: "Why this support",
    try: "Try this",
    ownership: "Keep students in charge",
    watch: "What to watch for",
    fade: "Fade the support",
    adjust: "Change or increase support",
    task: "Your task",
    frame: "A sentence starter",
    partner: "Ask your partner",
    copy: "Copy student materials",
    copied: "Copied",
    copyError: "Could not copy. Select and copy the text instead.",
    note: "This is a suggested application of the classroom evidence. Use your judgment to adapt it.",
  },
  es: {
    preview: "Vista previa de idiomas",
    languageMenuLabel: "Idioma de la aplicación y del docente",
    studentLanguageLabel: "Idioma de los materiales para estudiantes",
    studentLanguageHelp: "Elige el idioma que verán los estudiantes.",
    back: "Volver a Scaffold",
    eyebrow: "Tu espacio de planificación",
    title: "Tu enseñanza. Tu idioma.",
    intro:
      "Lee las orientaciones en el idioma que prefieras. Elige por separado el idioma de los materiales para tus estudiantes.",
    settings: "Preferencias de idioma",
    app: "Idioma de la aplicación",
    guidance: "Orientaciones para docentes",
    materials: "Materiales para estudiantes",
    guidanceHelp: "Sugerencias de enseñanza y aspectos que observar.",
    materialsHelp: "Consignas y estructuras de apoyo para estudiantes.",
    remembered: "Tus preferencias de idioma se guardan en este navegador.",
    notice:
      "Ejemplo preparado · Traducciones preliminares para revisar. El menú superior cambia la aplicación y las orientaciones para docentes; elige por separado el idioma de los materiales. La generación aún no está conectada.",
    context: "La situación en el aula",
    grade: "4.º grado · Lectura",
    example:
      "Ejemplo general · Sin vinculación a un perfil curricular aprobado",
    target: "Objetivo de aprendizaje",
    evidence: "Lo que observaste",
    teacher: "Para ti",
    student: "Para tus estudiantes",
    teacherSubtitle: "Una sugerencia para enseñar",
    studentSubtitle: "Para leer y trabajar juntos",
    compare: "Mostrar también el inglés",
    original: "Original en inglés",
    why: "Por qué este apoyo",
    try: "Prueba esto",
    ownership: "Deja las decisiones en manos de tus estudiantes",
    watch: "Qué observar",
    fade: "Retira el apoyo gradualmente",
    adjust: "Cambia o aumenta el apoyo",
    task: "Tu tarea",
    frame: "Una estructura para empezar",
    partner: "Pregúntale a tu compañero o compañera",
    copy: "Copiar materiales para estudiantes",
    copied: "Copiado",
    copyError: "No se pudo copiar. Selecciona y copia el texto.",
    note: "Esta sugerencia se basa en lo observado en el aula. Adáptala según tu criterio profesional.",
  },
} satisfies Record<Language, Record<string, string>>;

// Prepared translations of the existing character-action demo, not approved curriculum content.
export const guidance = {
  en: {
    target:
      "Explain what a character’s actions reveal, using evidence from the text.",
    evidence:
      "Students can retell what happened, but struggle to explain what a character’s actions reveal using evidence.",
    why: "The observation suggests students need help connecting an action to an interpretation and a supporting detail. Try a sentence frame and a short partner rehearsal, then check whether that connection becomes clearer.",
    steps: [
      "Ask students to choose one character action and point to a relevant detail in the text.",
      "Invite them to explain what the action reveals, using the sentence starter if helpful.",
      "Have partners ask which detail supports the idea. Students then write or revise their explanation.",
    ],
    ownership:
      "Students choose the action, interpretation, and evidence. The frame helps them connect their ideas; it does not supply the answer.",
    fade: "When students independently connect an action, an interpretation, and a relevant detail during partner talk, remove the full frame. Keep a short question only if needed.",
    adjust:
      "If students still retell, ask them to point to the action and explain what it might suggest. If finding evidence is the barrier, reread a short passage together and model how to locate a supporting detail before trying again.",
  },
  es: {
    target:
      "Explicar qué revelan las acciones de un personaje, usando evidencia del texto.",
    evidence:
      "Los estudiantes pueden contar lo que ocurrió, pero les cuesta explicar qué revelan las acciones de un personaje usando evidencia del texto.",
    why: "Lo observado sugiere que los estudiantes necesitan apoyo para relacionar una acción con una interpretación y un detalle que la respalde. Prueba una estructura de apoyo y un breve ensayo oral en parejas; después, comprueba si esa relación queda más clara.",
    steps: [
      "Pide a los estudiantes que elijan una acción de un personaje y señalen un detalle relevante del texto.",
      "Invítalos a explicar qué revela esa acción, usando la estructura de apoyo si les resulta útil.",
      "Pide que, en parejas, se pregunten qué detalle respalda la idea. Después, cada estudiante escribe o revisa su explicación.",
    ],
    ownership:
      "Los estudiantes eligen la acción, la interpretación y la evidencia. La estructura les ayuda a conectar sus ideas; no les proporciona la respuesta.",
    fade: "Cuando los estudiantes relacionen por sí mismos una acción, una interpretación y un detalle relevante durante el diálogo en parejas, retira la estructura completa. Mantén una pregunta breve solo si la necesitan.",
    adjust:
      "Si los estudiantes siguen limitándose a contar lo ocurrido, pídeles que señalen la acción y expliquen qué podría sugerir. Si la dificultad está en encontrar evidencia, relean juntos un pasaje breve y modela cómo localizar un detalle que respalde una idea antes de intentarlo de nuevo.",
  },
};
export const materials = {
  en: {
    task: "Choose one character action. Explain what it reveals and point to a detail in the text that supports your idea.",
    frame: "This action reveals ___ because the text says, ‘___.’",
    partner: "Which detail makes you think that?",
  },
  es: {
    task: "Elige una acción de un personaje. Explica qué revela y señala un detalle del texto que respalde tu idea.",
    frame: "Esta acción revela ___ porque el texto dice: «___».",
    partner: "¿Qué detalle te hace pensar eso?",
  },
};
