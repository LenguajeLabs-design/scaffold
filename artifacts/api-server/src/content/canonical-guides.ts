/**
 * Canonical planning guide snapshots used by Scaffold.
 *
 * These are repo-local copies of the trusted planning guides stored in the
 * user's source library. Keeping a stable snapshot inside the app lets the
 * prompt layer use real guide content in deployment rather than relying on
 * external Desktop file paths.
 */

export const CANONICAL_GUIDE_SOURCES = {
  plannerRules: "90_Canonical_Planning_Guides/Planner_Rules.md",
  widaCore: "90_Canonical_Planning_Guides/WIDA_Core_Guide.md",
  scaffolds: "90_Canonical_Planning_Guides/Scaffolds_By_WIDA_Level.md",
  grade4: "90_Canonical_Planning_Guides/Grade_4_EAL_Planning_Guide.md",
  grade5: "90_Canonical_Planning_Guides/Grade_5_EAL_Planning_Guide.md",
} as const;

const PLANNER_RULES = `
Purpose:
- Turn the source library into practical, consistent, teacher-friendly instructional support for multilingual learners.
- Behave like an experienced elementary EAL specialist: practical, clear, low-friction, WIDA-aware, and supportive of grade-level participation.

Source priority:
1. Canonical planning guides
2. WIDA standards and language charts
3. EAL program and grade-level unit documents
4. Writers Workshop, UFLI, scaffolding, and vocabulary support materials
5. Research articles for rationale and validation

Core planning principles:
- Keep students connected to grade-level learning whenever possible.
- Match supports to the language demand, not just to a general idea of difficulty.
- Use WIDA levels to shape scaffolds, expectations, and teacher moves.
- Prefer one strong scaffold over many weak or scattered supports.
- Reduce scaffolds over time toward greater independence.
- Keep outputs realistic for classroom use.
- Write for teachers who need quick clarity, not academic jargon.

Output requirements:
- lesson focus or topic
- content objective
- language objective
- key vocabulary
- sentence frames or language supports
- lesson sequence
- scaffolds matched to WIDA level
- differentiation notes
- quick assessment
- brief teacher notes

Privacy and safety:
- Never include student names, student records, diagnostic reports, family private documents, passports, or medical details.
- Do not infer personal student histories.
- Keep examples generic unless safe, non-identifying context is provided.

Product behavior:
- For quick classroom help, prioritize speed, clarity, and immediate usability.
- For full lesson planning, prioritize coherence, alignment, and realistic instructional flow.
- If the task sounds like a live classroom moment, respond like Classroom Copilot.
- If the task sounds like advance planning, respond like Lesson Planner.
`.trim();

const WIDA_CORE = `
Big planning ideas:
- WIDA should guide how students access the lesson, not remove them from meaningful learning.
- Language development happens through content-rich instruction.
- Supports should change with proficiency level, but expectations should still connect to the lesson goal.
- Teachers should plan both content learning and language use.

WIDA planning lens:
- What language will students need to understand?
- What language will students need to produce?
- Which domain matters most here: listening, speaking, reading, or writing?
- What is the likely language load for this task?
- What support level matches the student proficiency range?

Practical proficiency snapshot:
- WIDA 1-2: heavy visual support, oral rehearsal before writing, short sentence frames, picture word banks, reduced language load.
- WIDA 2-3: structured sentence support, modeled academic language, guided talk, graphic organizers, repeated key vocabulary.
- WIDA 3-4: expanded sentence and paragraph support, clear expectations for explanation, support for evidence and elaboration.
- WIDA 4+: more independence, support for nuance, precision, organization, and academic voice.

Language objectives should:
- connect to the lesson task
- name the language students will use
- reflect the expected mode of response
- be realistic for the WIDA range

Common planning mistakes:
- vague language objectives
- same scaffold for every proficiency level
- too much language support with no fade plan
- confusing content simplification with language support
- vocabulary lists that are too long
`.trim();

const SCAFFOLDS_BY_WIDA = `
Planning rule:
- Identify the main student task first: understand, discuss, explain, read, or write.
- Then choose the lightest scaffold that makes success more likely.

WIDA 1-2:
- visuals, picture word banks, labeled diagrams, gestures, oral rehearsal, short patterned sentence frames
- teacher moves: model first, rehearse aloud, point to visuals, reduce vocabulary load

WIDA 2-3:
- sentence starters, structured partner talk, graphic organizers, repeated vocabulary, chunked directions
- teacher moves: move from phrase to sentence, ask for one added detail, connect talk to writing

WIDA 3-4:
- paragraph organizers, evidence frames, elaboration prompts, mentor-text language lifts, targeted academic vocabulary
- teacher moves: prompt explanation, ask for evidence plus reasoning, support precision, reduce sentence support gradually

WIDA 4+:
- planning templates, revision prompts, academic discussion stems, checklists for independence
- teacher moves: push clarity and precision, support craft and organization, fade scaffolds intentionally

Scaffold selection by task:
- discussion: oral rehearsal, accountable talk, discussion stems
- explanation: cause/effect, evidence, reasoning frames
- writing: planning organizers, sentence frames, model texts, revision prompts
- vocabulary-heavy: visuals, word banks, repetition, context use

Do not:
- stack too many scaffolds at once
- keep the same support in place after students are ready to transfer
- give generic supports not tied to the lesson demand
`.trim();

const GRADE_4_GUIDE = `
Grade 4 planning profile:
- explain ideas more clearly in speech and writing
- move from simple retell into explanation and evidence
- manage more academic vocabulary
- participate in discussion with greater independence
- read and write with stronger organization

Common language demands:
- explain thinking
- describe processes or relationships
- compare ideas or texts
- justify an answer
- use evidence from reading or observation
- write organized paragraphs

Strong scaffold types:
- explanation sentence frames
- comparison organizers
- evidence-and-reasoning prompts
- vocabulary mats
- mentor-text excerpts
- oral rehearsal before writing

Language objective patterns:
- explain using sequence or cause-and-effect language
- compare using academic comparison language
- justify an idea with one piece of evidence and an explanation

WIDA guidance:
- WIDA 1-2: focus on core lesson language, oral participation first, visuals and structured frames
- WIDA 2-3: short explanation, supported paragraph work, visible reusable vocabulary
- WIDA 3-4: clearer explanation, stronger detail, growing independence

Planning cautions:
- avoid too much independent language load too early
- avoid long vocabulary lists
- do not separate language support from the actual lesson task
`.trim();

const GRADE_5_GUIDE = `
Grade 5 planning profile:
- discuss ideas with stronger reasoning
- write more structured multi-part responses
- use evidence more intentionally
- shift between narrative, informational, analytical, and argumentative tasks
- manage greater reading and vocabulary complexity

Common language demands:
- explain and elaborate
- support claims with reasons or evidence
- summarize and report information
- compare perspectives or texts
- discuss using accountable language
- write organized paragraphs and early essay structures

Strong scaffold types:
- claim-evidence-reasoning frames
- boxed paragraph planners
- discussion stems
- unit-specific vocabulary supports
- oral rehearsal before analytical writing
- mentor text language lifts
- revision checklists tied to the learning goal

Language objective patterns:
- explain thinking using evidence and one elaborated reason
- compare two ideas using contrast language and text support
- report information using key topic vocabulary and organized sections

WIDA guidance:
- WIDA 1-2: simplify language load, not the intellectual task; use visuals, oral rehearsal, and highly structured written support
- WIDA 2-3: move from supported sentences to connected explanation with repeated academic language patterns
- WIDA 3-4: push for stronger organization, evidence use, and precision while fading supports

Planning cautions:
- do not overestimate how much academic writing students can do without rehearsal
- avoid generic sentence frames that do not match the task
- do not separate vocabulary instruction from the lesson purpose
`.trim();

function getGradeGuide(gradeLevel: string): string {
  switch (gradeLevel) {
    case "Grade 4":
      return GRADE_4_GUIDE;
    case "Grade 5":
      return GRADE_5_GUIDE;
    default:
      return "";
  }
}

export function getCanonicalPlannerRulesText(): string {
  return PLANNER_RULES;
}

export function getCanonicalLessonContext(gradeLevel: string, widaBand: string): string {
  const gradeGuide = getGradeGuide(gradeLevel);

  return [
    "Canonical source material:",
    `- Planner rules source: ${CANONICAL_GUIDE_SOURCES.plannerRules}`,
    `- WIDA guide source: ${CANONICAL_GUIDE_SOURCES.widaCore}`,
    `- Scaffold guide source: ${CANONICAL_GUIDE_SOURCES.scaffolds}`,
    gradeGuide
      ? `- Grade guide source: ${gradeLevel === "Grade 4" ? CANONICAL_GUIDE_SOURCES.grade4 : CANONICAL_GUIDE_SOURCES.grade5}`
      : "- Grade guide source: none for this grade yet; use WIDA and planner rules first",
    "",
    "Planner rules:",
    PLANNER_RULES,
    "",
    "WIDA core guidance:",
    WIDA_CORE,
    "",
    "Scaffold guidance:",
    SCAFFOLDS_BY_WIDA,
    gradeGuide ? `\n\n${gradeLevel} guide:\n${gradeGuide}` : "",
    "",
    `Current WIDA band to honor: ${widaBand}`,
  ].join("\n");
}

export function getCanonicalCopilotContext(gradeLevel: string, widaLevel: string): string {
  const gradeGuide = getGradeGuide(gradeLevel);

  return [
    "Canonical source material:",
    `- Planner rules source: ${CANONICAL_GUIDE_SOURCES.plannerRules}`,
    `- WIDA guide source: ${CANONICAL_GUIDE_SOURCES.widaCore}`,
    `- Scaffold guide source: ${CANONICAL_GUIDE_SOURCES.scaffolds}`,
    gradeGuide
      ? `- Grade guide source: ${gradeLevel === "Grade 4" ? CANONICAL_GUIDE_SOURCES.grade4 : CANONICAL_GUIDE_SOURCES.grade5}`
      : "- Grade guide source: none for this grade yet; use WIDA and scaffold rules first",
    "",
    "Planner rules:",
    PLANNER_RULES,
    "",
    "WIDA core guidance:",
    WIDA_CORE,
    "",
    "Scaffold guidance:",
    SCAFFOLDS_BY_WIDA,
    gradeGuide ? `\n\n${gradeLevel} guide:\n${gradeGuide}` : "",
    "",
    `Current WIDA level to honor: ${widaLevel}`,
  ].join("\n");
}
