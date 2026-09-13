import { getCanonicalUnitProfile } from "./canonical-unit-profiles";

export const CANONICAL_GUIDE_SOURCES = {
  plannerRules: "Scaffold instructional planning rules",
  supportFramework: "Scaffold Language Support Level framework",
  grade4: "Scaffold Grade 4 planning profile",
  grade5: "Scaffold Grade 5 planning profile",
} as const;

const PLANNER_RULES = `
Purpose:
- Turn teacher notes into practical, original instructional support for multilingual learners.
- Keep students connected to grade-level thinking and meaningful participation.
- Match support to the language work of the task, not to a label alone.
- Prefer one useful support over a pile of disconnected accommodations.
- Plan for gradual release as students demonstrate more independent access.

Support framework:
- Ask: How much language support does this learner need for this task right now?
- Consider listening, speaking, reading, and writing separately.
- Use observation and student work to adjust support; do not make assessment or placement decisions.
- Use Scaffold's six Language Support Levels as an instructional planning lens, not as a diagnosis or score.

Useful supports include visuals, modeling, vocabulary support, sentence frames, oral rehearsal, chunked directions, partner structures, examples, translation options, differentiated participation, and gradual release.

Privacy and safety:
- Never request student names, records, diagnoses, family documents, passports, or medical details.
- Keep examples generic unless safe, non-identifying context is provided.
`.trim();

const SUPPORT_LEVELS = `
Scaffold Language Support Levels:
1. Intensive language support — make the task visible and participatory through modeling, visuals, gestures, translated or bilingual resources when available, and supported response choices.
2. High language support — combine clear models, selected vocabulary, chunked directions, partner rehearsal, and short response frames.
3. Moderate language support — provide a model and a few reusable language tools while students explain, discuss, read, or write more of the response themselves.
4. Targeted language support — identify the specific language move that is blocking access and offer a focused prompt, example, organizer, or revision cue.
5. Light language support — keep a small reference such as a word bank, checklist, or discussion stem available while students manage most of the task independently.
6. Independent access — invite students to select, adapt, and monitor the language resources they need, with optional teacher feedback.

These levels describe the amount and type of instructional support for a particular task. They do not describe a student's identity, diagnose ability, certify proficiency, or determine placement.
`.trim();

const GRADE_4_GUIDE = "Grade 4 planning profile: explain ideas, use evidence, compare information, manage academic vocabulary, and participate in organized discussion and writing.";
const GRADE_5_GUIDE = "Grade 5 planning profile: develop reasoning, organize multi-part responses, use evidence intentionally, compare perspectives, and revise for clarity and precision.";

function getGradeGuide(gradeLevel: string): string { return gradeLevel === "Grade 4" ? GRADE_4_GUIDE : gradeLevel === "Grade 5" ? GRADE_5_GUIDE : ""; }
export function getCanonicalPlannerRulesText(): string { return PLANNER_RULES; }
export function getCanonicalLessonContext(gradeLevel: string, languageSupportLevel: string, topic: string, notes: string, unitProfile?: string): string {
  const unit = getCanonicalUnitProfile(gradeLevel, topic, notes, unitProfile);
  return ["Scaffold source material:", PLANNER_RULES, SUPPORT_LEVELS, getGradeGuide(gradeLevel), unit ?? "", `Current Language Support Level: ${languageSupportLevel}`].filter(Boolean).join("\n");
}
export function getCanonicalCopilotContext(gradeLevel: string, languageSupportLevel: string): string {
  return ["Scaffold source material:", PLANNER_RULES, SUPPORT_LEVELS, getGradeGuide(gradeLevel), `Current Language Support Level: ${languageSupportLevel}`].filter(Boolean).join("\n");
}
