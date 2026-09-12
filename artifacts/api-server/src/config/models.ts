function maxTokens(name: string, fallback: number): number {
  const raw = process.env[name];
  const value = raw === undefined ? fallback : Number(raw);
  if (!Number.isSafeInteger(value) || value < 256 || value > 8192) {
    throw new Error(`${name} must be an integer from 256 to 8192`);
  }
  return value;
}

export const MODELS = {
  LESSON_PLAN: "gpt-5.2",
  CLASSROOM_COPILOT: "gpt-5-mini",
} as const;

export const MAX_TOKENS = {
  // These are deliberately modest beta defaults. Raise them only through
  // server configuration, where the global token ceilings still apply.
  LESSON_PLAN: maxTokens("LESSON_PLAN_MAX_TOKENS", 3000),
  CLASSROOM_COPILOT: maxTokens("CLASSROOM_COPILOT_MAX_TOKENS", 1200),
} as const;
