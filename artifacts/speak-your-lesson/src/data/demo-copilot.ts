import type { ClassroomSupport } from "@workspace/api-client-react";

export const DEMO_COPILOT_SESSIONS: ClassroomSupport[] = [
  {
    simpleExplanation:
      "A character’s action can give you a clue about what the character is thinking, feeling, or choosing. To explain your idea, name the action and connect it to a detail from the text.",
    keyVocabulary: ["character", "action", "reveal", "evidence", "because"],
    sentenceFrames: [
      "The character ___ when ___.",
      "This action reveals ___ because the text says, \"___.\"",
      "The detail ___ supports my thinking because ___.",
    ],
    quickActivity:
      "Action → clue rehearsal (about 3 minutes).\n\n1. Ask students to point to one character action in the text.\n2. Partners complete: ‘This action reveals ___ because ___.’\n3. The listener asks, ‘Which detail makes you think that?’",
    extensionQuestion:
      "What other detail could support your interpretation, and would it make you change or strengthen your thinking?",
    teacherMove:
      "When a student retells, affirm the event and ask: ‘What does that action reveal? Point to the detail that makes you think so.’ Keep the sentence frame visible while the student rehearses.",
  },
];
