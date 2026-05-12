import { Router, type IRouter } from "express";
import { rateLimit } from "express-rate-limit";
import { GenerateClassroomSupportBody, GenerateClassroomSupportResponse } from "@workspace/api-zod";
import type { z } from "zod/v4";
import { MODELS, MAX_TOKENS } from "../config/models";
import { callOpenAIForJSON } from "../services/openai.service";
import { buildClassroomSupportPrompt } from "../services/prompts";

type ClassroomSupport = z.infer<typeof GenerateClassroomSupportResponse>;

const router: IRouter = Router();

// Classroom Copilot is a lighter call used during live teaching moments —
// limit to 20 per hour per IP. Generous for real classroom use but prevents
// automated scraping.
const classroomCopilotRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    error:
      "You've reached the limit of 20 Classroom Copilot requests per hour. Please wait a little while before continuing.",
  },
});

router.post("/classroom-copilot/generate", classroomCopilotRateLimit, async (req, res) => {
  const parseResult = GenerateClassroomSupportBody.safeParse(req.body);

  if (!parseResult.success) {
    req.log.warn({ issues: parseResult.error.issues }, "Invalid classroom support request body");
    res.status(400).json({ error: "Invalid request body" });
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
    res.json(support);
  } catch (err) {
    req.log.error({ err }, "Failed to generate classroom support");
    res.status(500).json({ error: "Failed to generate classroom support. Please try again." });
  }
});

export default router;
