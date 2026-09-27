import { Router, type IRouter } from "express";
import { FUNNEL_EVENTS, logFunnel, type FunnelSurface } from "../lib/funnel-logger";

const router: IRouter = Router();
const surfaces = new Set<FunnelSurface>(["landing", "planner", "copilot"]);
const events = new Set<string>(FUNNEL_EVENTS);

router.post("/events", (req, res) => {
  const event = typeof req.body?.event === "string" ? req.body.event : "";
  const surface = typeof req.body?.surface === "string" ? req.body.surface : "";
  if (!events.has(event) || !surfaces.has(surface as FunnelSurface)) {
    res.status(400).json({ error: "Invalid analytics event." });
    return;
  }

  logFunnel(event as (typeof FUNNEL_EVENTS)[number], surface as FunnelSurface);
  res.status(204).end();
});

export default router;
