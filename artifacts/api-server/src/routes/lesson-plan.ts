import { Router, type IRouter } from "express";
import { GenerateLessonPlanBody, GenerateLessonPlanResponse } from "@workspace/api-zod";
import { MODELS, MAX_TOKENS } from "../config/models";
import { callOpenAIForJSON } from "../services/openai.service";
import { buildLessonPlanPrompt } from "../services/prompts";
import { authenticate, AccessError, type Actor } from "../lib/auth";
import { UsageLimit } from "../lib/usage-store";
import { logUsage } from "../lib/usage-logger";

const router: IRouter = Router();
router.post("/lesson-plan/generate", async (req, res) => {
  res.set("Cache-Control", "no-store");
  let actor: Actor | undefined;
  try {
    actor = await authenticate(req);
    const parsed = GenerateLessonPlanBody.safeParse({ ...req.body, accessCode: actor.admin ? "admin" : req.body?.accessCode });
    const requestKey = req.get("Idempotency-Key") ?? "";
    if (!parsed.success || !/^[a-zA-Z0-9_-]{16,128}$/.test(requestKey)) {
      logUsage({ feature: "lesson-plan", event: "blocked", reason: "validation" });
      res.status(400).json({ error: "Invalid request. Please refresh and try again." });
      return;
    }
    const input = parsed.data;
    if (!input.notes.trim() || input.notes.length > 2000 || !input.topic.trim() || input.topic.length > 200) {
      res.status(400).json({ error: "Please keep your description within 2,000 characters and any topic within 200 characters." });
      return;
    }
    const prompts = buildLessonPlanPrompt(input);
    const result = await callOpenAIForJSON({ ...prompts, actor, ip: req.ip ?? "unknown", requestKey,
      feature: "lesson-plan", model: MODELS.LESSON_PLAN, maxTokens: MAX_TOKENS.LESSON_PLAN });
    const validated = GenerateLessonPlanResponse.safeParse(result);
    if (!validated.success) throw new Error("Invalid generated response");
    res.json(validated.data);
  } catch (error) {
    const reason = error instanceof UsageLimit ? error.reason : error instanceof AccessError ? "auth" : "generation_unavailable";
    logUsage({ feature: "lesson-plan", event: "blocked", actor: actor?.id, traffic: actor ? actor.admin ? "admin_test" : "beta" : undefined, reason });
    if (error instanceof UsageLimit) {
      res.set("Retry-After", String(error.retryAfter));
      res.status(error.status).json({ error: error.message, code: error.reason });
    } else if (error instanceof AccessError) {
      res.status(401).json({ error: error.message });
    } else {
      res.status(503).json({ error: "Scaffold couldn't complete this generation. Please wait before trying again. Submitted attempts may count toward your beta allowance." });
    }
  }
});
export default router;
