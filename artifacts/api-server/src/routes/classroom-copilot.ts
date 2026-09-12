import { Router, type IRouter } from "express";
import { GenerateClassroomSupportBody, GenerateClassroomSupportResponse } from "@workspace/api-zod";
import { MODELS, MAX_TOKENS } from "../config/models";
import { callOpenAIForJSON } from "../services/openai.service";
import { buildClassroomSupportPrompt } from "../services/prompts";
import { authenticate, AccessError, type Actor } from "../lib/auth";
import { UsageLimit } from "../lib/usage-store";
import { logUsage } from "../lib/usage-logger";

const router: IRouter = Router();
router.post("/classroom-copilot/generate", async (req, res) => {
  res.set("Cache-Control", "no-store");
  let actor: Actor | undefined;
  try {
    actor = await authenticate(req);
    const parsed = GenerateClassroomSupportBody.safeParse({ ...req.body, accessCode: actor.admin ? "admin" : req.body?.accessCode });
    const requestKey = req.get("Idempotency-Key") ?? "";
    if (!parsed.success || !/^[a-zA-Z0-9_-]{16,128}$/.test(requestKey)) {
      logUsage({ feature: "classroom-copilot", event: "blocked", reason: "validation" });
      res.status(400).json({ error: "Invalid request. Please refresh and try again." });
      return;
    }
    const input = parsed.data;
    if (!input.need.trim() || input.need.length > 2000) {
      res.status(400).json({ error: "Please keep your description within 2,000 characters." });
      return;
    }
    const prompts = buildClassroomSupportPrompt(input);
    const result = await callOpenAIForJSON({ ...prompts, actor, ip: req.ip ?? "unknown", requestKey,
      feature: "classroom-copilot", model: MODELS.CLASSROOM_COPILOT, maxTokens: MAX_TOKENS.CLASSROOM_COPILOT });
    const validated = GenerateClassroomSupportResponse.safeParse(result);
    if (!validated.success) throw new Error("Invalid generated response");
    res.json(validated.data);
  } catch (error) {
    const reason = error instanceof UsageLimit ? error.reason : error instanceof AccessError ? "auth" : "generation_unavailable";
    logUsage({ feature: "classroom-copilot", event: "blocked", actor: actor?.id, traffic: actor ? actor.admin ? "admin_test" : "beta" : undefined, reason });
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
