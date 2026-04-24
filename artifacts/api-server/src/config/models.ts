/**
 * AI model identifiers and token limits.
 *
 * All model names and token budgets are defined here so they can be changed
 * in one place without hunting through route or service files.
 *
 * Lesson planning uses the more capable model because it produces longer,
 * more structured output. Classroom support uses the faster, cheaper model
 * because teachers need a quick answer during a live lesson.
 */

export const MODELS = {
  LESSON_PLAN: "gpt-5.2",
  CLASSROOM_COPILOT: "gpt-5-mini",
} as const;

export const MAX_TOKENS = {
  LESSON_PLAN: 8192,
  CLASSROOM_COPILOT: 4096,
} as const;
