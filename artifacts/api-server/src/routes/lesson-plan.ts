import { Router, type IRouter } from "express";
import { rateLimit } from "express-rate-limit";
import { GenerateLessonPlanBody, GenerateLessonPlanResponse } from "@workspace/api-zod";
import type { z } from "zod/v4";
import { MODELS, MAX_TOKENS } from "../config/models";
import { callOpenAIForJSON } from "../services/openai.service";
import { buildLessonPlanPrompt } from "../services/prompts";

type LessonPlan = z.infer<typeof GenerateLessonPlanResponse>;

const router: IRouter = Router();

// Lesson plan generation is a heavy AI call — limit to 10 per hour per IP.
// A teacher planning a full week generates 5 plans; this gives real headroom
// for revision while making bulk abuse economically unattractive.
const lessonPlanRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    error:
      "You've reached the limit of 10 lesson plans per hour. Please wait a little while before generating more.",
  },
});

router.post("/lesson-plan/generate", lessonPlanRateLimit, async (req, res) => {
  const parseResult = GenerateLessonPlanBody.safeParse(req.body);

  if (!parseResult.success) {
    req.log.warn({ issues: parseResult.error.issues }, "Invalid lesson plan request body");
    res.status(400).json({ error: "Invalid request body" });
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
    res.json(lessonPlan);
  } catch (err) {
    req.log.error({ err }, "Failed to generate lesson plan");
    res.status(500).json({ error: "Failed to generate lesson plan. Please try again." });
  }
});

export default router;
