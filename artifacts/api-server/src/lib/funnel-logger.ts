import { logger } from "./logger";

export const FUNNEL_EVENTS = [
  "landing_cta_clicked",
  "sample_opened",
  "sample_use_with_lesson_clicked",
  "planner_started",
  "first_useful_move_visible",
  "support_copied",
  "support_adapted",
  "plan_saved",
  "return_visit",
  "off_topic_redirected",
] as const;

export type FunnelEvent = (typeof FUNNEL_EVENTS)[number];
export type FunnelSurface = "landing" | "planner" | "copilot";
export type FunnelReason =
  | "unrelated_request"
  | "prohibited_decision"
  | "private_information";

export function logFunnel(event: FunnelEvent, surface: FunnelSurface, reason?: FunnelReason): void {
  logger.info({ type: "funnel", event, surface, ...(reason ? { reason } : {}) }, "funnel event");
}
