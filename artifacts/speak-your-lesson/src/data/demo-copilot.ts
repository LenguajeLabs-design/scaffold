import type { ClassroomSupport } from "@workspace/api-client-react";

export const DEMO_COPILOT_SESSIONS: ClassroomSupport[] = [
  {
    simpleExplanation:
      "A fraction shows a part of something whole. Imagine a pizza cut into 4 equal slices — if you eat 1 slice, you ate 1 out of 4 equal pieces. We write that as 1/4.\n\nThe bottom number (denominator) tells us how many equal pieces the whole is cut into. The top number (numerator) tells us how many pieces we are talking about.",
    keyVocabulary: ["fraction", "numerator", "denominator", "equal parts", "whole", "half", "fourth"],
    sentenceFrames: [
      "The whole is divided into ___ equal parts.",
      "The fraction ___ means I have ___ out of ___ parts.",
      "The numerator tells us ___, and the denominator tells us ___.",
    ],
    quickActivity:
      "Fold and label — takes about 2 minutes.\n\n1. Give each student a piece of paper. Ask them to fold it in half, then in half again.\n2. Open it up — how many equal parts do they see? (4 parts = fourths)\n3. Each student writes the fraction for one part on a sticky note and holds it up.\n4. Ask: 'If I fold it one more time, how many parts will I have?'",
    extensionQuestion:
      "If you and a friend each get 1/4 of a pizza, and another friend gets 1/2 of a different pizza, who has more? Does the size of the whole matter? How do you know?",
    teacherMove:
      "Use physical objects — folded paper, cut fruit pictures, pattern blocks — to make the abstract concrete. Point to the numerator and denominator explicitly every time you say the words aloud.",
  },
  {
    simpleExplanation:
      "The water cycle is how water moves around Earth in a never-ending circle. Water from oceans and lakes turns into tiny droplets that rise into the air — that is called evaporation.\n\nUp high where it is cold, those droplets group together to form clouds — that is condensation. When clouds get heavy, water falls back down as rain or snow — that is precipitation. Then it flows back to rivers and starts again.",
    keyVocabulary: ["water cycle", "evaporation", "condensation", "precipitation", "runoff", "vapor"],
    sentenceFrames: [
      "During evaporation, water ___.",
      "Condensation happens when ___.",
      "Precipitation is when ___.",
      "The water cycle repeats because ___.",
    ],
    quickActivity:
      "Mini water cycle demo — takes about 3 minutes.\n\n1. Give each student a small zip-lock bag with a little water inside.\n2. Tape the bag to a sunny window (or hold it near a warm lamp).\n3. Watch for tiny droplets forming on the inside of the bag.\n4. Ask: 'Which step of the water cycle are we seeing right now?' Students write the step name on a sticky note.",
    extensionQuestion:
      "Where does the water in your drinking glass come from — and where will it go after you drink it? Trace its full journey through as many steps of the water cycle as you can.",
    teacherMove:
      "Draw the cycle on the board as you explain each step — students copy it and add arrows. For WIDA 1–2 students, provide a pre-drawn diagram with blanks for the vocabulary words.",
  },
];
