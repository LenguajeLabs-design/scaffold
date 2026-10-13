/**
 * Teacher-reviewable reasoning kept with a locally saved plan. These are
 * generated starting points, not curriculum claims or learner determinations.
 */
export interface PlanningDiagnosis {
  learningGoal: string;
  languageDemand: string;
  likelyBarrier: string;
  chosenScaffold: string;
  selectedAlternativeIds: string[];
}

export interface ScaffoldAlternative {
  id: string;
  title: string;
  detail: string;
  needTag: string;
}

export const SCAFFOLD_ALTERNATIVES: ScaffoldAlternative[] = [
  {
    id: "make-language-visible",
    title: "Make target language visible",
    detail: "Name, post, and point to the language move students need in the task.",
    needTag: "Matches language demand",
  },
  {
    id: "support-evidence-selection",
    title: "Support evidence selection",
    detail: "Have students locate and mark the detail that supports their idea.",
    needTag: "Matches evidence use",
  },
  {
    id: "rehearse-before-writing",
    title: "Rehearse before independent writing",
    detail: "Give partners time to say and refine the idea before they write independently.",
    needTag: "Matches participation need",
  },
];
