/**
 * Prompt builders for each AI feature.
 *
 * All prompt logic lives here — separate from route and service files — so
 * prompt copy can be iterated without touching any HTTP or AI plumbing.
 *
 * Each builder returns { systemPrompt, userPrompt } ready to pass to the
 * OpenAI service. The JSON schema comments at the top of each user prompt
 * are load-bearing: they significantly improve the consistency of the AI's
 * structured output.
 */

export interface LessonPlanPromptArgs {
  gradeLevel: string;
  widaBand: string;
  topic: string;
  notes: string;
}

export interface ClassroomSupportPromptArgs {
  gradeLevel: string;
  widaLevel: string;
  need: string;
}

export interface PromptPair {
  systemPrompt: string;
  userPrompt: string;
}

// Inline schema strings anchor the AI to a predictable JSON shape.
// Changing field names here must be mirrored in the OpenAPI spec.
const LESSON_PLAN_JSON_SCHEMA = `{
  "title": "lesson title",
  "contentObjective": "students will be able to...",
  "languageObjective": "students will be able to use language to...",
  "keyVocabulary": ["word1", "word2", "word3", "word4", "word5"],
  "sentenceFrames": ["frame1", "frame2", "frame3"],
  "warmUp": "description of warm-up activity",
  "mainActivity": "description of main activity",
  "speakingActivity": "description of speaking/language activity",
  "exitTicket": "description of exit ticket",
  "teacherNotes": "practical teacher tips and notes"
}`;

const CLASSROOM_SUPPORT_JSON_SCHEMA = `{
  "simpleExplanation": "one or two plain sentences explaining the concept simply",
  "keyVocabulary": ["word1", "word2", "word3", "word4", "word5"],
  "sentenceFrames": ["frame one ____.", "frame two ____.", "frame three ____."],
  "quickActivity": "a short 2-3 minute activity teachers can do right now",
  "extensionQuestion": "one deeper thinking question for students who are ready",
  "teacherMove": "one specific concrete thing the teacher should do or say right now"
}`;

export function buildLessonPlanPrompt(args: LessonPlanPromptArgs): PromptPair {
  const systemPrompt =
    "You are an expert ESL/ELD curriculum designer specializing in elementary multilingual learner " +
    "classrooms. You create practical, structured, WIDA-aligned lesson plans. " +
    "Always return valid JSON only — no markdown, no code blocks, just the raw JSON object.";

  const userPrompt =
    "Turn these rough teacher planning notes into a clear, low-prep, high-impact lesson plan " +
    "for an elementary multilingual learner classroom. Include a content objective, language objective, " +
    "key vocabulary, sentence frames, warm-up, main activity, speaking task, exit ticket, and teacher notes. " +
    "Make it practical and ready to teach tomorrow.\n\n" +
    `Grade Level: ${args.gradeLevel}\n` +
    `WIDA Band: ${args.widaBand}\n` +
    `Topic/Subject: ${args.topic}\n\n` +
    `Teacher's Planning Notes:\n${args.notes}\n\n` +
    "Return your response as valid JSON only (no markdown, no code blocks) with exactly this structure:\n" +
    LESSON_PLAN_JSON_SCHEMA;

  return { systemPrompt, userPrompt };
}

export function buildClassroomSupportPrompt(args: ClassroomSupportPromptArgs): PromptPair {
  const systemPrompt =
    "You are an expert elementary EAL teacher. Give practical, short, immediately usable classroom support. " +
    "Always return valid JSON only — no markdown, no code blocks.";

  const userPrompt =
    "A teacher needs immediate EAL classroom support.\n\n" +
    `Grade Level: ${args.gradeLevel}\n` +
    `WIDA Level: ${args.widaLevel}\n` +
    `Student Need: ${args.need}\n\n` +
    "Provide practical, short, immediately usable support. Use clear student-friendly language. " +
    "Match the WIDA level. Avoid long explanations. Avoid generic advice.\n\n" +
    "Return valid JSON only (no markdown, no code blocks) with exactly these keys:\n" +
    CLASSROOM_SUPPORT_JSON_SCHEMA;

  return { systemPrompt, userPrompt };
}
