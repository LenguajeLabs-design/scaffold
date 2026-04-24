import { Router, type IRouter } from "express";
import { GenerateLessonPlanBody, GenerateLessonPlanResponse } from "@workspace/api-zod";
import type { z } from "zod/v4";
import { MODELS, MAX_TOKENS } from "../config/models";
import { callOpenAIForJSON } from "../services/openai.service";
import { buildLessonPlanPrompt } from "../services/prompts";

type LessonPlan = z.infer<typeof GenerateLessonPlanResponse>;

const router: IRouter = Router();

router.post("/lesson-plan/generate", async (req, res) => {
  const parseResult = GenerateLessonPlanBody.safeParse(req.body);

  if (!parseResult.success) {
    // Log validation details server-side for debugging; return a generic message to the client.
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
