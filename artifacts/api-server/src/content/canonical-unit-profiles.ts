export const CANONICAL_UNIT_PROFILE_SOURCES = {
  ealDesk:
    "EALDesk Elementary: Grade 4 Discipline-Based Writing unit (artifacts/english-lab-planner/src/lib/content/yearly-overviews.ts)",
  localPlanner:
    "90_Canonical_Planning_Guides/Grade_4_Informational_Writing_Pilot/Grade_4_EAL_Informational_Writing_Plan.docx",
  widaFramework:
    "90_Canonical_Planning_Guides/Grade_4_Informational_Writing_Pilot/WIDA-ELD-Standards-Framework-2020-Edition-Grades-4-5.pdf",
  canDo:
    "90_Canonical_Planning_Guides/Grade_4_Informational_Writing_Pilot/CanDo-KeyUses-Gr-4-5.pdf",
  languageCharts:
    "90_Canonical_Planning_Guides/Grade_4_Informational_Writing_Pilot/WIDA-Language-Charts.pdf",
  teachingLearningCycle:
    "90_Canonical_Planning_Guides/Grade_4_Informational_Writing_Pilot/WIDA-Webinar-handout-scaffolding-writing-through-teaching-learning-cycle.pdf",
} as const;

const GRADE_4_DISCIPLINE_BASED_WRITING = `
Canonical unit profile: Grade 4 Discipline-Based Writing

Curriculum purpose:
- Apply informational and explanatory writing across science, social studies, and inquiry tasks.
- Teach readers accurately using organized facts, evidence, explanation, and subject-specific vocabulary.

Content standards:
- W.4.2: Write informative/explanatory texts.
- W.4.4: Produce clear, coherent writing appropriate to task, purpose, and audience.
- W.4.5: Strengthen writing through planning, revising, and editing.
- W.4.7: Conduct short research projects.
- W.4.8: Recall and gather relevant information, take notes, and categorize information.
- Alignment note: core CCSS were verified from the Grade 4 information checklist; exact unit sub-strands still require confirmation against the full local curriculum map.

Integrated planning priorities:
- Clarify whether students are explaining, comparing, reporting, or arguing.
- Build oral understanding of the content before expecting extended academic writing.
- Move from shared research and notes to organized sections and increasingly independent writing.
- Assess both content accuracy and the language students use to communicate disciplinary understanding.

Language demands:
- Use subject-specific vocabulary and disciplinary text structures.
- Organize information into a topic, related sections, evidence or examples, explanation, and conclusion.
- Turn notes into connected teaching sentences and paragraphs.
- Explain how evidence supports an idea rather than merely listing facts.
- Synthesize information from sources using an increasingly precise academic tone.

Teaching-Learning Cycle:
1. Build the field through visuals, shared texts, demonstrations, vocabulary, and structured talk.
2. Deconstruct a mentor explanation to notice organization, language functions, and high-value language features.
3. Co-construct an explanation from shared notes while making decisions visible.
4. Support independent construction with the lightest effective scaffold.
5. Review student work for content understanding, language growth, and scaffold dependence.

WIDA-calibrated support:
- WIDA 1-2: use visuals, labeled diagrams, shared notes, oral rehearsal, and short patterned teaching sentences. Accept diagrams, labels, and jointly constructed sentences as meaningful entry points.
- WIDA 2-3: use chunked sources, section starters, topic-specific word banks, partner rehearsal, and modeling that turns one note at a time into a complete sentence.
- WIDA 3-4: use notes-to-paragraph organizers and evidence-plus-explanation prompts. Expect connected paragraphs while fading sentence-level support.
- WIDA 4+: emphasize synthesis, precise vocabulary, disciplinary organization, audience awareness, and independent revision.

Reusable language patterns:
- This section explains ___.
- One important fact is ___.
- The evidence shows ___.
- This helps explain ___.
- This evidence is important because ___.
- A key idea in this topic is ___.
- In conclusion, ___.

Formative assessment and scaffold fading:
- Check whether the student can explain the idea orally before drafting.
- Check whether notes are grouped into meaningful sections.
- Check whether evidence is followed by explanation.
- Record which supports were needed: model, visual, word bank, sentence frame, partner rehearsal, or teacher prompting.
- Fade one support at a time and look for successful transfer before removing another.
- Use the exit task to capture both the content idea and the target language function.

Planning boundary:
- Preserve grade-level intellectual work; adjust access and language support rather than replacing the task with an unrelated easier activity.
- Select only vocabulary students need to understand or produce the explanation.
- Do not invent a precise WIDA standard code or local curriculum requirement when the source context does not establish it.
`.trim();

const DISCIPLINE_WRITING_TERMS = [
  "informational",
  "informative",
  "explanatory",
  "explanation",
  "discipline-based",
  "disciplinary writing",
  "research",
  "report",
  "science writing",
  "social studies writing",
  "nonfiction writing",
];

export function getCanonicalUnitProfile(
  gradeLevel: string,
  topic: string,
  notes: string,
  unitProfile?: string,
): string {
  if (gradeLevel !== "Grade 4") return "";

  const planningText = `${topic} ${notes}`.toLowerCase();
  const isDisciplineBasedWriting =
    unitProfile === "Grade 4 Discipline-Based Writing" ||
    DISCIPLINE_WRITING_TERMS.some((term) => planningText.includes(term));

  if (!isDisciplineBasedWriting) return "";

  return [
    "Canonical pilot sources:",
    `- EALDesk curriculum source: ${CANONICAL_UNIT_PROFILE_SOURCES.ealDesk}`,
    `- Local unit source: ${CANONICAL_UNIT_PROFILE_SOURCES.localPlanner}`,
    `- WIDA Framework source: ${CANONICAL_UNIT_PROFILE_SOURCES.widaFramework}`,
    `- Can Do source: ${CANONICAL_UNIT_PROFILE_SOURCES.canDo}`,
    `- Language Charts source: ${CANONICAL_UNIT_PROFILE_SOURCES.languageCharts}`,
    `- Teaching-Learning Cycle source: ${CANONICAL_UNIT_PROFILE_SOURCES.teachingLearningCycle}`,
    "",
    GRADE_4_DISCIPLINE_BASED_WRITING,
  ].join("\n");
}
