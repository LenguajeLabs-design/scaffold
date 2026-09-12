import { logger } from "./logger";
export type FeatureKey = "lesson-plan" | "classroom-copilot";
export function logUsage(event: {
  event: "reserved" | "completed" | "failed" | "blocked";
  feature: FeatureKey | "access";
  traffic?: "admin_test" | "beta";
  actor?: string;
  requestId?: string;
  reason?: string;
  model?: string;
  reservedTokens?: number;
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
}): void {
  logger.info({ type: "usage", ...event }, "usage event");
}
