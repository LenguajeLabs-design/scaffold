import type { ClassroomSupport } from "@workspace/api-client-react";

export const DEMO_COPILOT_SESSIONS: ClassroomSupport[] = [
  {
    simpleExplanation:
      "A fraction is a way to show a part of something whole. Imagine a pizza cut into 4 equal slices — if you eat 1 slice, you ate 1 out of 4 equal pieces. We write that as 1/4. The bottom number (denominator) tells us how many equal pieces the whole is cut into. The top number (numerator) tells us how many pieces we are talking about.",
    keyVocabulary: ["fraction", "numerator", "denominator", "equal parts", "whole", "half", "fourth"],
    sentenceFrames: [
      "The whole is divided into ___ equal parts.",
      "The fraction ___ means I have ___ out of ___ parts.",
      "The numerator is ___ because ___.",
      "The denominator tells us ___.",
    ],
    quickActivity:
      "Fold a piece of paper in half, then in half again. Open it up — how many equal parts do you see? Write the fraction for one part on a sticky note and hold it up. Now fold a different way and repeat. Students compare: whose fraction is bigger?",
    extensionQuestion:
      "If you and a friend each get 1/4 of a pizza, and another friend gets 1/2 of a different pizza, who has more pizza? Does the size of the whole matter? How do you know?",
    teacherMove:
      "Use physical objects (folded paper, cut fruit pictures, pattern blocks) to make the abstract concrete. For WIDA 1–2 students, draw the fraction before asking them to name it. Point to the numerator and denominator explicitly each time you say the words.",
  },
  {
    simpleExplanation:
      "The water cycle is how water moves around Earth over and over again — like a circle that never stops. Water from oceans, lakes, and rivers turns into tiny water droplets that rise into the air (we call that evaporation). Up high, where it's cold, those droplets group together to form clouds (condensation). When clouds get heavy with water, it falls back down as rain or snow (precipitation). Then it flows back to rivers and oceans and the cycle begins again.",
    keyVocabulary: ["water cycle", "evaporation", "condensation", "precipitation", "runoff", "groundwater", "vapor"],
    sentenceFrames: [
      "During evaporation, water ___.",
      "Condensation happens when ___.",
      "Precipitation is ___.",
      "After precipitation, water ___.",
      "The water cycle repeats because ___.",
    ],
    quickActivity:
      "Give each student a small cup of warm water and a plastic bag sealed with a little cold water taped at the top. Hold the bag over the warm cup — watch droplets form on the cold plastic. Ask: 'Which step of the water cycle are we seeing right now?' Students label the step on a sticky note.",
    extensionQuestion:
      "Where does the water in your drinking glass come from — and where will it go after you drink it? Trace its journey through as many steps of the water cycle as you can.",
    teacherMove:
      "Draw the cycle on the board as you explain each step — students can copy it and add arrows. For WIDA 1–2 students, provide a pre-drawn diagram with blanks for the vocabulary words. For WIDA 3–4, ask them to explain one step to a partner before the class debrief.",
  },
];
