import type { LessonPlan } from "@workspace/api-client-react";

export const DEMO_CLASSROOM_PROBLEM =
  "Students can retell what happened, but struggle to explain what a character’s actions reveal using evidence.";

export const DEMO_STUDENT_TASK =
  "Retell a key event, name a character action, and explain what that action reveals using a detail from the text.";

export const DEMO_LEARNING_GOAL =
  "Students will explain what a character’s actions reveal and support the explanation with evidence from the text.";

export const DEMO_LESSON_PLAN: LessonPlan = {
  title: "Explaining what character actions reveal",
  integratedUnitGoal: DEMO_LEARNING_GOAL,
  contentObjective: DEMO_LEARNING_GOAL,
  languageObjective:
    "Students will connect a character action to an interpretation using because, this shows, and a cited detail from the text.",
  languageFunctionObjective:
    "Students will explain an interpretation of a character using evidence.",
  languageFeatureObjective:
    "Students will use evidence phrases and cause-and-effect language to connect an action to what it reveals.",
  keyVocabulary: ["character", "action", "reveal", "evidence", "because"],
  sentenceFrames: [
    "The character ___ when ___.",
    "This action reveals ___ because the text says, \"___.\"",
    "The detail ___ supports my thinking because ___.",
  ],
  warmUp:
    "After students retell a key event, ask them to point to one character action and complete the frame: ‘The character ___, which reveals ___.’ Rehearse the idea with a partner before anyone writes.",
  mainActivity:
    "Students choose one key event from the text, name the character’s action, and explain what the action reveals. They underline the text detail that supports the explanation, then rehearse the explanation with a partner before writing.",
  speakingActivity:
    "Partners take turns explaining one character action. The listener asks, ‘Which detail makes you think that?’ The speaker adds the detail or revises the explanation.",
  exitTicket:
    "Students write one explanation that names a character action, states what it reveals, and includes one supporting detail from the text.",
  teacherNotes:
    `Classroom problem: ${DEMO_CLASSROOM_PROBLEM}\n\nKeep the meaning-making with students. The frame should help students connect their own interpretation to evidence, not supply the interpretation for them.`,
  scaffoldPlan:
    "One useful move: After the retell, have students point to one character action and complete: ‘This action reveals ___ because the text says ___.’ Say the connector aloud, then let students choose the action, interpretation, and evidence.",
  scaffoldFadingPlan:
    "1. Begin with the complete frame and a teacher think-aloud showing how to point from an action to evidence.\n2. Fade when students independently name an action, offer an interpretation, and point to a relevant detail during partner talk.\n3. Remove the complete frame first; keep only the short prompt ‘What does the action reveal? Which detail supports you?’ if students still need a cue.",
  formativeAssessment:
    "Watch for three parts: a specific character action, an interpretation that goes beyond retelling, and a relevant detail from the text. Note whether the student makes the connection independently, with the full frame, or after a prompt.",
  sourcesUsed: [],
};

// Kept as an array for the existing demo plumbing; the pilot intentionally has
// one stable sample instead of rotating through unrelated examples.
export const DEMO_LESSON_PLANS: LessonPlan[] = [DEMO_LESSON_PLAN];
