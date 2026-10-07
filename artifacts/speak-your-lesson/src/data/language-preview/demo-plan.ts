import type { LessonPlan } from "@workspace/api-client-react";
import { DEMO_LESSON_PLAN } from "@/data/demo-lesson";
import { guidance, type Language } from "@/data/language-preview/copy";

const spanishTeacherPlan: LessonPlan = {
  ...DEMO_LESSON_PLAN,
  title: "Explicar lo que revelan las acciones de los personajes",
  integratedUnitGoal:
    "Los estudiantes comprenderán cómo las acciones de un personaje revelan ideas y usarán evidencia del texto para explicar su interpretación.",
  contentObjective:
    "Los estudiantes explicarán qué revelan las acciones de un personaje y respaldarán su interpretación con evidencia del texto.",
  languageObjective:
    "Los estudiantes relacionarán una acción del personaje con una interpretación usando porque, esto demuestra y un detalle citado del texto.",
  languageFunctionObjective:
    "Los estudiantes explicarán una interpretación sobre un personaje usando evidencia.",
  languageFeatureObjective:
    "Los estudiantes usarán frases para presentar evidencia y expresar causa y efecto al relacionar una acción con lo que revela.",
  warmUp:
    "Después de que los estudiantes cuenten un evento importante, pídeles que señalen una acción del personaje y completen: «El personaje ___, lo que revela ___.» Que ensayen la idea con una pareja antes de escribir.",
  mainActivity:
    "Los estudiantes elegirán un evento importante del texto, nombrarán la acción del personaje y explicarán qué revela. Subrayarán el detalle del texto que respalda su explicación, ensayarán la idea con una pareja y luego la escribirán.",
  speakingActivity:
    "En parejas, los estudiantes se turnarán para explicar una acción del personaje. Quien escucha preguntará: «¿Qué detalle te hace pensar eso?» Quien habla añadirá el detalle o revisará su explicación.",
  exitTicket:
    "Cada estudiante escribirá una explicación que nombre una acción del personaje, diga qué revela e incluya un detalle del texto que la respalde.",
  teacherNotes:
    `Situación del aula: ${guidance.es.evidence}\n\nMantén la construcción de significado en manos de los estudiantes. La estructura debe ayudarles a relacionar su propia interpretación con la evidencia, no darles la interpretación.`,
  scaffoldPlan:
    "Un paso útil: después de que cuenten el evento, pídeles que señalen una acción del personaje y completen: «Esta acción revela ___ porque el texto dice ___.» Di en voz alta el conector y deja que los estudiantes elijan la acción, la interpretación y la evidencia.",
  scaffoldFadingPlan: guidance.es.fade,
  formativeAssessment:
    "Observa tres elementos: una acción específica del personaje, una interpretación que vaya más allá de volver a contar y un detalle pertinente del texto. Registra si el estudiante relaciona estos elementos por sí mismo, con la estructura completa o después de recibir una indicación.",
};

const spanishVocabulary = [
  "personaje",
  "acción",
  "revelar",
  "evidencia",
  "porque",
];

const spanishSentenceFrames = [
  "El personaje ___ cuando ___.",
  "Esta acción revela ___ porque el texto dice: «___.»",
  "El detalle ___ respalda mi idea porque ___.",
];

/** Prepared example translation for preview only; it is not generated curriculum content. */
export function getPreviewLessonPlan(
  teacherLanguage: Language,
  studentMaterialsLanguage: Language,
): LessonPlan {
  let plan =
    teacherLanguage === "es"
      ? { ...spanishTeacherPlan }
      : { ...DEMO_LESSON_PLAN };
  if (teacherLanguage !== studentMaterialsLanguage) {
    if (teacherLanguage === "en") {
      plan = {
        ...plan,
        warmUp: plan.warmUp.replace(
          "‘The character ___, which reveals ___.’",
          "«El personaje ___, lo que revela ___.»",
        ),
        speakingActivity: plan.speakingActivity.replace(
          "‘Which detail makes you think that?’",
          "«¿Qué detalle te hace pensar eso?»",
        ),
        scaffoldPlan: plan.scaffoldPlan.replace(
          "‘This action reveals ___ because the text says ___.’",
          "«Esta acción revela ___ porque el texto dice ___.»",
        ),
      };
    } else {
      plan = {
        ...plan,
        warmUp: plan.warmUp.replace(
          "«El personaje ___, lo que revela ___.»",
          "‘The character ___, which reveals ___.’",
        ),
        speakingActivity: plan.speakingActivity.replace(
          "«¿Qué detalle te hace pensar eso?»",
          "‘Which detail makes you think that?’",
        ),
        scaffoldPlan: plan.scaffoldPlan.replace(
          "«Esta acción revela ___ porque el texto dice ___.»",
          "‘This action reveals ___ because the text says ___.’",
        ),
      };
    }
  }
  if (studentMaterialsLanguage === "es") {
    return {
      ...plan,
      keyVocabulary: [...spanishVocabulary],
      sentenceFrames: [...spanishSentenceFrames],
    };
  }
  return {
    ...plan,
    keyVocabulary: [...DEMO_LESSON_PLAN.keyVocabulary],
    sentenceFrames: [...DEMO_LESSON_PLAN.sentenceFrames],
  };
}
