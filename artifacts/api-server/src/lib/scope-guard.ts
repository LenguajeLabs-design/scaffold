import type { FunnelReason } from "./funnel-logger";

export const SCOPE_REDIRECT_MESSAGE =
  "I can help with the lesson-planning side of that. What are students being asked to do, and where are they getting stuck?";

export interface ScopeCheck {
  allowed: boolean;
  reason?: FunnelReason;
  message?: string;
}

const instructionalSignals = /\b(?:lesson|teach(?:ing)?|student|classroom|class|task|learning goal|objective|read(?:ing)?|writ(?:e|ing)|text|evidence|retell|character|discussion|vocabulary|sentence|multilingual|language barrier|scaffold|support|explain|stuck|worksheet|exit ticket|unit|conference|partner)\b/i;
const clearlyUnrelatedSignals = /\b(?:weather|recipe|recipes|cook(?:ing)?|flight|hotel|travel|vacation|tax(?:es)?|stock market|coding|programming|javascript|python|relationship|dating|sports score|movie recommendation|home repair|car repair|shopping list)\b/i;
const prohibitedDecisionSignals = /\b(?:diagnos(?:e|is|ing)|official language proficiency|proficiency score|placement|eligibility|exit decision|certif(?:y|ication)|classif(?:y|ication)|label this student|determine (?:a )?level)\b/i;
const privateInformationSignals = /\b(?:student names?|full names?|medical records?|diagnos(?:is|es)|iep|passport|home address|phone number|email address|family documents?)\b/i;

export function checkPlanningScope(value: string): ScopeCheck {
  const normalized = value.trim();
  if (!normalized) return { allowed: true };

  if (privateInformationSignals.test(normalized)) {
    return {
      allowed: false,
      reason: "private_information",
      message:
        "Please leave out student names and private information. I can help with the lesson-planning side of this: what are students being asked to do, and where are they getting stuck?",
    };
  }

  if (prohibitedDecisionSignals.test(normalized)) {
    return {
      allowed: false,
      reason: "prohibited_decision",
      message:
        "Scaffold can help plan instructional support, but it cannot diagnose students or make proficiency, placement, eligibility, or exit decisions. What classroom task and observed language barrier should we work on?",
    };
  }

  if (clearlyUnrelatedSignals.test(normalized) && !instructionalSignals.test(normalized)) {
    return {
      allowed: false,
      reason: "unrelated_request",
      message: SCOPE_REDIRECT_MESSAGE,
    };
  }

  return { allowed: true };
}
