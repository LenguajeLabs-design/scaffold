import { Router, type IRouter } from "express";
import { rateLimit } from "express-rate-limit";
import { GenerateLessonPlanBody, GenerateLessonPlanResponse } from "@workspace/api-zod";
import type { z } from "zod/v4";
import { MODELS, MAX_TOKENS } from "../config/models";
import { callOpenAIForJSON } from "../services/openai.service";
import { buildLessonPlanPrompt } from "../services/prompts";
import { isValidCode, checkAndRecord } from "../lib/access-codes";
import { logUsage } from "../lib/usage-logger";

type LessonPlan = z.infer<typeof GenerateLessonPlanResponse>;

const router: IRouter = Router();

// Backstop IP-based flood limit — 20 requests per hour across all codes.
const ipRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    error: "Too many requests from this connection. Please try again later.",
  },
});

const MAX_INPUT_CHARS = 2000;

router.post("/lesson-plan/generate", ipRateLimit, async (req, res) => {
  // --- Access code check ---
  const rawCode = (req.body?.accessCode as string | undefined) ?? "";
  if (!rawCode || !isValidCode(rawCode)) {
    logUsage({ feature: "lesson-plan", accessCode: rawCode || "none", inputLength: 0, success: false, errorKind: "auth" });
    res.status(401).json({ error: "Invalid or missing access code." });
    return;
  }

  // --- Per-code rate limit (3/day + 30s cooldown) ---
  const limitResult = checkAndRecord(rawCode, "lesson-plan");
  if (!limitResult.allowed) {
    const message =
      limitResult.reason === "cooldown"
        ? `Please wait ${Math.ceil(limitResult.waitMs / 1000)} seconds before generating another lesson plan.`
        : "You've used all 3 lesson plans for today. Your limit resets at midnight UTC.";
    logUsage({ feature: "lesson-plan", accessCode: rawCode, inputLength: 0, success: false, errorKind: "rate_limit" });
    res.status(429).json({ error: message });
    return;
  }

  // --- Body validation ---
  const parseResult = GenerateLessonPlanBody.safeParse(req.body);
  if (!parseResult.success) {
    req.log.warn({ issues: parseResult.error.issues }, "Invalid lesson plan request body");
    logUsage({ feature: "lesson-plan", accessCode: rawCode, inputLength: 0, success: false, errorKind: "validation" });
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  // --- Input length guard ---
  const { notes } = parseResult.data;
  if (notes.length > MAX_INPUT_CHARS) {
    logUsage({ feature: "lesson-plan", accessCode: rawCode, inputLength: notes.length, success: false, errorKind: "validation" });
    res.status(400).json({ error: `Planning notes must be ${MAX_INPUT_CHARS} characters or fewer.` });
    return;
  }

  const { systemPrompt, userPrompt } = buildLessonPlanPrompt(parseResult.data);

  try {
    const lessonPlan = await callOpenAIForJSON<LessonPlan>({
      model: MODELS.LESSON_PLAN,
      maxTokens: MAX_TOKENS.LESSON_PLAN,
      systemPrompt,
      userPrompt,
    });
    logUsage({ feature: "lesson-plan", accessCode: rawCode, inputLength: notes.length, success: true });
    res.json(lessonPlan);
  } catch (err) {
    req.log.error({ err }, "Failed to generate lesson plan");
    logUsage({ feature: "lesson-plan", accessCode: rawCode, inputLength: notes.length, success: false, errorKind: "openai" });
    res.status(500).json({ error: "Failed to generate lesson plan. Please try again." });
  }
});

export default router;
