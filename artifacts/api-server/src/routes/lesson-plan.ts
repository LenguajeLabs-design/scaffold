import { Router, type IRouter } from "express";
import { GenerateLessonPlanBody, GenerateLessonPlanResponse } from "@workspace/api-zod";
import { MODELS, MAX_TOKENS } from "../config/models";
import { callOpenAIForJSON, GenerationServiceError } from "../services/openai.service";
import { buildLessonPlanPrompt } from "../services/prompts";
import { authenticate, AccessError, type Actor } from "../lib/auth";
import { UsageLimit } from "../lib/usage-store";
import { logUsage } from "../lib/usage-logger";
import { logFunnel } from "../lib/funnel-logger";
import { checkPlanningScope } from "../lib/scope-guard";
import { beta } from "../config/beta";

const router: IRouter = Router();
router.post("/lesson-plan/generate", async (req, res) => {
  res.set("Cache-Control", "no-store");
  let actor: Actor | undefined;
  try {
    actor = await authenticate(req);
    const parsed = GenerateLessonPlanBody.safeParse({
      ...req.body,
      accessCode:
        actor.admin || !beta.requireAccessCode ? "public" : req.body?.accessCode,
    });
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
    const scope = checkPlanningScope(`${input.topic}\n${input.notes}`);
    if (!scope.allowed) {
      logFunnel("off_topic_redirected", "planner", scope.reason);
      res.status(400).json({ error: scope.message, code: "off_topic" });
      return;
    }
    const prompts = buildLessonPlanPrompt(input);
    const result = await callOpenAIForJSON({ ...prompts, actor, ip: req.ip ?? "unknown", requestKey,
      feature: "lesson-plan", model: MODELS.LESSON_PLAN, maxTokens: MAX_TOKENS.LESSON_PLAN });
    const validated = GenerateLessonPlanResponse.safeParse(result);
    if (!validated.success) throw new GenerationServiceError("invalid_output");
    res.json(validated.data);
  } catch (error) {
    const reason = error instanceof UsageLimit ? error.reason : error instanceof AccessError ? "auth" : error instanceof GenerationServiceError ? error.reason : "generation_unavailable";
    logUsage({ feature: "lesson-plan", event: "blocked", actor: actor?.id, traffic: actor ? actor.admin ? "admin_test" : "beta" : undefined, reason });
    if (error instanceof UsageLimit) {
      res.set("Retry-After", String(error.retryAfter));
      res.status(error.status).json({ error: error.message, code: error.reason });
    } else if (error instanceof AccessError) {
      res.status(401).json({ error: error.message });
    } else if (error instanceof GenerationServiceError) {
      if (error.providerStatus === 401 || error.providerStatus === 403) {
        res.status(503).json({ error: "Scaffold’s lesson service needs attention. Please contact Federico before trying again.", code: "provider_credentials" });
      } else if (error.providerStatus === 429) {
        res.status(503).json({ error: "Scaffold’s lesson service is temporarily at capacity. Please try again later.", code: "provider_capacity" });
      } else if (error.reason === "invalid_output") {
        res.status(503).json({ error: "Scaffold received an incomplete lesson response. Please try again in a moment.", code: "invalid_model_output" });
      } else {
        res.status(503).json({ error: "Scaffold’s lesson service is temporarily unavailable. Please try again later.", code: "provider_unavailable" });
      }
    } else {
      res.status(503).json({ error: "Scaffold couldn't complete this generation. Please wait before trying again. Submitted attempts may count toward your beta allowance." });
    }
  }
});
export default router;
