import { Router, type IRouter } from "express";
import { GenerateLessonPlanBody } from "@workspace/api-zod";
import { openai } from "@workspace/integrations-openai-ai-server";

const router: IRouter = Router();

router.post("/lesson-plan/generate", async (req, res) => {
  const parseResult = GenerateLessonPlanBody.safeParse(req.body);

  if (!parseResult.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  const { notes, gradeLevel, widaBand, topic } = parseResult.data;

  const userPrompt = `Turn these rough teacher planning notes into a clear, low-prep, high-impact lesson plan for an elementary multilingual learner classroom. Include a content objective, language objective, key vocabulary, sentence frames, warm-up, main activity, speaking task, exit ticket, and teacher notes. Make it practical and ready to teach tomorrow.

Grade Level: ${gradeLevel}
WIDA Band: ${widaBand}
Topic/Subject: ${topic}

Teacher's Planning Notes:
${notes}

Return your response as valid JSON only (no markdown, no code blocks) with exactly this structure:
{
  "title": "lesson title",
  "contentObjective": "students will be able to...",
  "languageObjective": "students will be able to use language to...",
  "keyVocabulary": ["word1", "word2", "word3", "word4", "word5"],
  "sentenceFrames": ["frame1", "frame2", "frame3"],
  "warmUp": "description of warm-up activity",
  "mainActivity": "description of main activity",
  "speakingActivity": "description of speaking/language activity",
  "exitTicket": "description of exit ticket",
  "teacherNotes": "practical teacher tips and notes"
}`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-5.2",
      max_completion_tokens: 8192,
      messages: [
        {
          role: "system",
          content:
            "You are an expert ESL/ELD curriculum designer specializing in elementary multilingual learner classrooms. You create practical, structured, WIDA-aligned lesson plans. Always return valid JSON only — no markdown, no code blocks, just the raw JSON object.",
        },
        {
          role: "user",
          content: userPrompt,
        },
      ],
    });

    const content = completion.choices[0]?.message?.content;

    if (!content) {
      res.status(500).json({ error: "No response from AI" });
      return;
    }

    let lessonPlan: unknown;
    try {
      lessonPlan = JSON.parse(content);
    } catch {
      req.log.error({ content }, "Failed to parse AI response as JSON");
      res.status(500).json({ error: "Failed to parse lesson plan response" });
      return;
    }

    res.json(lessonPlan);
  } catch (err) {
    req.log.error({ err }, "Error generating lesson plan");
    res.status(500).json({ error: "Failed to generate lesson plan" });
  }
});

export default router;
