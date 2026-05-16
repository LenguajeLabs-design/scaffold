/**
 * Usage logger.
 *
 * Logs structured, privacy-safe usage events.
 * Never logs raw input text, student names, or identifiable content.
 *
 * Fields logged:
 *   timestamp   ISO 8601
 *   feature     "lesson-plan" | "classroom-copilot"
 *   accessCode  upper-cased, as entered (never the raw secret)
 *   inputLength character count of the user's freetext input
 *   success     boolean
 *   errorKind   optional — "validation" | "openai" | "rate_limit" | "auth"
 */

import { logger } from "./logger";

export type FeatureKey = "lesson-plan" | "classroom-copilot";

export interface UsageEvent {
  feature: FeatureKey;
  accessCode: string;
  inputLength: number;
  success: boolean;
  errorKind?: "validation" | "openai" | "rate_limit" | "auth";
}

export function logUsage(event: UsageEvent): void {
  logger.info(
    {
      type: "usage",
      timestamp: new Date().toISOString(),
      feature: event.feature,
      accessCode: event.accessCode.trim().toUpperCase(),
      inputLength: event.inputLength,
      success: event.success,
      ...(event.errorKind ? { errorKind: event.errorKind } : {}),
    },
    "usage event",
  );
}
