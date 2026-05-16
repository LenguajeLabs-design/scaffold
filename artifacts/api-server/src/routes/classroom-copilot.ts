import { Router, type IRouter } from "express";
import { rateLimit } from "express-rate-limit";
import { GenerateClassroomSupportBody, GenerateClassroomSupportResponse } from "@workspace/api-zod";
import type { z } from "zod/v4";
import { MODELS, MAX_TOKENS } from "../config/models";
import { callOpenAIForJSON } from "../services/openai.service";
import { buildClassroomSupportPrompt } from "../services/prompts";
import { isValidCode, checkAndRecord } from "../lib/access-codes";
import { logUsage } from "../lib/usage-logger";

type ClassroomSupport = z.infer<typeof GenerateClassroomSupportResponse>;

const router: IRouter = Router();

// Backstop IP-based flood limit.
const ipRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 40,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    error: "Too many requests from this connection. Please try again later.",
  },
});

const MAX_INPUT_CHARS = 2000;

router.post("/classroom-copilot/generate", ipRateLimit, async (req, res) => {
  // --- Access code check ---
  const rawCode = (req.body?.accessCode as string | undefined) ?? "";
  if (!rawCode || !isValidCode(rawCode)) {
    logUsage({ feature: "classroom-copilot", accessCode: rawCode || "none", inputLength: 0, success: false, errorKind: "auth" });
    res.status(401).json({ error: "Invalid or missing access code." });
    return;
  }

  // --- Per-code rate limit (3/day + 30s cooldown) ---
  const limitResult = checkAndRecord(rawCode, "classroom-copilot");
  if (!limitResult.allowed) {
    const message =
      limitResult.reason === "cooldown"
        ? `Please wait ${Math.ceil(limitResult.waitMs / 1000)} seconds before generating again.`
        : "You've used all 3 Classroom Copilot requests for today. Your limit resets at midnight UTC.";
    logUsage({ feature: "classroom-copilot", accessCode: rawCode, inputLength: 0, success: false, errorKind: "rate_limit" });
    res.status(429).json({ error: message });
    return;
  }

  // --- Body validation ---
  const parseResult = GenerateClassroomSupportBody.safeParse(req.body);
  if (!parseResult.success) {
    req.log.warn({ issues: parseResult.error.issues }, "Invalid classroom support request body");
    logUsage({ feature: "classroom-copilot", accessCode: rawCode, inputLength: 0, success: false, errorKind: "validation" });
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  // --- Input length guard ---
  const { need } = parseResult.data;
  if (need.length > MAX_INPUT_CHARS) {
    logUsage({ feature: "classroom-copilot", accessCode: rawCode, inputLength: need.length, success: false, errorKind: "validation" });
    res.status(400).json({ error: `Your description must be ${MAX_INPUT_CHARS} characters or fewer.` });
    return;
  }

  const { systemPrompt, userPrompt } = buildClassroomSupportPrompt(parseResult.data);

  try {
    const support = await callOpenAIForJSON<ClassroomSupport>({
      model: MODELS.CLASSROOM_COPILOT,
      maxTokens: MAX_TOKENS.CLASSROOM_COPILOT,
      systemPrompt,
      userPrompt,
    });
    logUsage({ feature: "classroom-copilot", accessCode: rawCode, inputLength: need.length, success: true });
    res.json(support);
  } catch (err) {
    req.log.error({ err }, "Failed to generate classroom support");
    logUsage({ feature: "classroom-copilot", accessCode: rawCode, inputLength: need.length, success: false, errorKind: "openai" });
    res.status(500).json({ error: "Failed to generate classroom support. Please try again." });
  }
});

export default router;
