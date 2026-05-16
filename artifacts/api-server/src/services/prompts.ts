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
//
// TEXT FORMATTING RULES for multi-sentence fields:
//   • Use "\n\n" between distinct paragraphs or phases.
//   • Use "• " (bullet + space) at the start of each bullet-point line.
//   • Use "1. " / "2. " for numbered steps.
//   • Use "Label: " pattern (word + colon + space) to introduce sub-sections.
//   • Never use Markdown (no **, no ##, no backticks).
const LESSON_PLAN_JSON_SCHEMA = `{
  "title": "lesson title",
  "contentObjective": "students will be able to...",
  "languageObjective": "students will be able to use language to...",
  "keyVocabulary": ["word1", "word2", "word3", "word4", "word5"],
  "sentenceFrames": ["frame1 ____.", "frame2 ____.", "frame3 ____."],
  "warmUp": "Setup sentence.\n\n1. First step for the teacher.\n2. Second step.\n3. Third step.\n\nDebrief: One closing note.",
  "mainActivity": "Overview sentence.\n\nDirections:\n1. Step one.\n2. Step two.\n3. Step three.\n\nDifferentiation: Note for WIDA levels.",
  "speakingActivity": "Overview sentence.\n\nSetup:\n• What students do.\n• Partner structure.\n\nSample prompts:\n• Example one.\n• Example two.\n\nDebrief: Closing move.",
  "exitTicket": "One sentence framing the exit ticket.\n\n• Option A: Quick written prompt.\n• Option B: Draw and label.\n\nTeacher tip: How to collect and sort responses.",
  "teacherNotes": "• Tip for WIDA 1-2 students.\n• Tip for WIDA 3+ students.\n• Scaffolding note.\n• What to watch for."
}`;

const CLASSROOM_SUPPORT_JSON_SCHEMA = `{
  "simpleExplanation": "Two or three plain sentences explaining the concept simply. Use everyday words.",
  "keyVocabulary": ["word1", "word2", "word3", "word4", "word5"],
  "sentenceFrames": ["frame one ____.", "frame two ____.", "frame three ____."],
  "quickActivity": "One sentence framing the activity.\n\n1. Step one.\n2. Step two.\n3. Step three.",
  "extensionQuestion": "One deeper thinking question for students who are ready.",
  "teacherMove": "One specific concrete thing the teacher should do or say right now."
}`;

export function buildLessonPlanPrompt(args: LessonPlanPromptArgs): PromptPair {
  const systemPrompt =
    "You are an expert ESL/ELD curriculum designer specializing in elementary multilingual learner " +
    "classrooms. You create practical, structured, WIDA-aligned lesson plans. " +
    "Always return valid JSON only — no Markdown, no code blocks, just the raw JSON object. " +
    "For multi-sentence fields use plain-text formatting: separate paragraphs with \\n\\n, " +
    "bullet points with '• ' prefix, numbered steps with '1. ' prefix, and sub-section labels " +
    "as 'Label: text'. Never use Markdown syntax (**bold**, ## headings, backticks, etc.).";

  const userPrompt =
    "Turn these rough teacher planning notes into a clear, low-prep, high-impact lesson plan " +
    "for an elementary multilingual learner classroom. Include a content objective, language objective, " +
    "key vocabulary, sentence frames, warm-up, main activity, speaking task, exit ticket, and teacher notes. " +
    "Make it practical and ready to teach tomorrow.\n\n" +
    `Grade Level: ${args.gradeLevel}\n` +
    `WIDA Band: ${args.widaBand}\n` +
    `Topic/Subject: ${args.topic}\n\n` +
    `Teacher's Planning Notes:\n${args.notes}\n\n` +
    "IMPORTANT: For all multi-sentence fields (warmUp, mainActivity, speakingActivity, exitTicket, teacherNotes) " +
    "use structured plain-text formatting:\n" +
    "  - Separate distinct phases/paragraphs with \\n\\n\n" +
    "  - Use '• ' (bullet + space) at the start of bullet-point lines\n" +
    "  - Use '1. ' / '2. ' for numbered steps\n" +
    "  - Use 'Label: ' to introduce sub-sections (e.g. 'Debrief: ...', 'Differentiation: ...')\n" +
    "  - Do NOT use Markdown (no **, no ##, no backticks)\n\n" +
    "Return your response as valid JSON only (no markdown, no code blocks) with exactly this structure:\n" +
    LESSON_PLAN_JSON_SCHEMA;

  return { systemPrompt, userPrompt };
}

export function buildClassroomSupportPrompt(args: ClassroomSupportPromptArgs): PromptPair {
  const systemPrompt =
    "You are an expert elementary EAL teacher. Give practical, short, immediately usable classroom support. " +
    "Always return valid JSON only — no Markdown, no code blocks. " +
    "For multi-sentence fields use plain-text structure: separate paragraphs with \\n\\n, " +
    "numbered steps with '1. ' prefix, bullet points with '• ' prefix. No Markdown syntax.";

  const userPrompt =
    "A teacher needs immediate EAL classroom support.\n\n" +
    `Grade Level: ${args.gradeLevel}\n` +
    `WIDA Level: ${args.widaLevel}\n` +
    `Student Need: ${args.need}\n\n` +
    "Provide practical, short, immediately usable support. Use clear student-friendly language. " +
    "Match the WIDA level. Avoid long explanations. Avoid generic advice.\n\n" +
    "For the quickActivity field, use numbered steps (1. / 2. / 3.) separated by \\n\\n if helpful.\n\n" +
    "Return valid JSON only (no markdown, no code blocks) with exactly these keys:\n" +
    CLASSROOM_SUPPORT_JSON_SCHEMA;

  return { systemPrompt, userPrompt };
}
