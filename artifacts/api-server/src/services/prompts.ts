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

import {
  getCanonicalCopilotContext,
  getCanonicalLessonContext,
  getCanonicalPlannerRulesText,
} from "../content/canonical-guides";

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

const LESSON_PLANNING_REQUIREMENTS = [
  "Create a practical lesson a teacher could teach tomorrow.",
  "Keep the content objective and language objective clearly distinct.",
  "Choose key vocabulary that is essential to the lesson, not a long list.",
  "Make sentence frames useful and teachable, not generic filler.",
  "Use scaffolds that clearly fit the WIDA band and the actual task demand.",
  "Keep activities coherent from warm-up through exit ticket.",
  "Use teacherNotes for actionable guidance, not vague reminders.",
].join(" ");

const CLASSROOM_COPILOT_REQUIREMENTS = [
  "Act like a skilled EAL specialist helping during a live lesson.",
  "Give the smallest useful move that will help right now.",
  "Keep explanations short, concrete, and student-friendly.",
  "Match the scaffold to the immediate task demand.",
  "Avoid generic advice and long theory.",
  "Make the teacherMove specific enough to say or do immediately.",
].join(" ");

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
  const canonicalContext = getCanonicalLessonContext(args.gradeLevel, args.widaBand);
  const systemPrompt =
    "You are an expert elementary EAL curriculum designer and instructional coach. " +
    "You create practical, structured, WIDA-aligned lesson plans for multilingual learners. " +
    getCanonicalPlannerRulesText() + " " +
    LESSON_PLANNING_REQUIREMENTS + " " +
    "Always return valid JSON only — no Markdown, no code blocks, just the raw JSON object. " +
    "For multi-sentence fields use plain-text formatting: separate paragraphs with \\n\\n, " +
    "bullet points with '• ' prefix, numbered steps with '1. ' prefix, and sub-section labels " +
    "as 'Label: text'. Never use Markdown syntax (**bold**, ## headings, backticks, etc.).";

  const userPrompt =
    "Turn these rough teacher planning notes into a clear, low-prep, high-impact lesson plan " +
    "for an elementary multilingual learner classroom.\n\n" +
    `Grade Level: ${args.gradeLevel}\n` +
    `WIDA Band: ${args.widaBand}\n` +
    `Topic/Subject: ${args.topic}\n\n` +
    `Canonical guide context:\n${canonicalContext}\n\n` +
    `Teacher's Planning Notes:\n${args.notes}\n\n` +
    "Planning instructions:\n" +
    "- Infer the likely lesson demand from the topic and notes.\n" +
    "- Build a coherent sequence from warm-up to exit ticket.\n" +
    "- Keep the lesson realistic for one class period unless the notes clearly suggest otherwise.\n" +
    "- Use no more than 5 high-value vocabulary words unless fewer are more appropriate.\n" +
    "- Make sentence frames closely match what students need to say or write in this lesson.\n" +
    "- In teacherNotes, include actionable bullets that help the teacher differentiate and watch for likely student needs.\n" +
    "- Do not mention missing information or ask follow-up questions. Make the most reasonable teacher-friendly assumptions.\n\n" +
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
  const canonicalContext = getCanonicalCopilotContext(args.gradeLevel, args.widaLevel);
  const systemPrompt =
    "You are an expert elementary EAL teacher and live classroom coach. " +
    getCanonicalPlannerRulesText() + " " +
    CLASSROOM_COPILOT_REQUIREMENTS + " " +
    "Always return valid JSON only — no Markdown, no code blocks. " +
    "For multi-sentence fields use plain-text structure: separate paragraphs with \\n\\n, " +
    "numbered steps with '1. ' prefix, bullet points with '• ' prefix. No Markdown syntax.";

  const userPrompt =
    "A teacher needs immediate EAL classroom support.\n\n" +
    `Grade Level: ${args.gradeLevel}\n` +
    `WIDA Level: ${args.widaLevel}\n` +
    `Student Need: ${args.need}\n\n` +
    `Canonical guide context:\n${canonicalContext}\n\n` +
    "Support instructions:\n" +
    "- Assume this is a real classroom moment and the teacher needs help right now.\n" +
    "- Identify the most likely language demand behind the student need.\n" +
    "- Choose one strong scaffolding move rather than many scattered supports.\n" +
    "- Keep keyVocabulary tight and relevant.\n" +
    "- Make sentenceFrames sound usable by real students in the described moment.\n" +
    "- Make teacherMove a specific action or line the teacher can use immediately.\n" +
    "- Avoid long explanations and avoid generic advice.\n\n" +
    "For the quickActivity field, use numbered steps (1. / 2. / 3.) separated by \\n\\n if helpful.\n\n" +
    "Return valid JSON only (no markdown, no code blocks) with exactly these keys:\n" +
    CLASSROOM_SUPPORT_JSON_SCHEMA;

  return { systemPrompt, userPrompt };
}
