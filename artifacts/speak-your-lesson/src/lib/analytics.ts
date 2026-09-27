import { resolveApiUrl } from "./api-base-url";

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

// Funnel events intentionally contain only a controlled event name and UI
// surface. Never pass teacher notes, student information, or free text here.
export function trackFunnelEvent(event: FunnelEvent, surface: FunnelSurface): void {
  void fetch(resolveApiUrl("/api/events"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ event, surface }),
    keepalive: true,
  }).catch(() => {
    // Analytics must never interrupt planning.
  });
}
