import { Router, type IRouter } from "express";
import { GenerateClassroomSupportBody } from "@workspace/api-zod";
import { openai } from "@workspace/integrations-openai-ai-server";

const router: IRouter = Router();

router.post("/classroom-copilot/generate", async (req, res) => {
  const parseResult = GenerateClassroomSupportBody.safeParse(req.body);

  if (!parseResult.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  const { need, gradeLevel, widaLevel } = parseResult.data;

  const userPrompt = `You are an expert elementary EAL/ESL teacher. A teacher needs immediate classroom support.

Grade Level: ${gradeLevel}
WIDA Level: ${widaLevel}
Student Need: ${need}

Provide practical, short, immediately usable EAL support. Use clear student-friendly language. Match the WIDA level. Avoid long explanations. Avoid generic advice.

Return valid JSON only (no markdown, no code blocks) with exactly these keys:
{
  "simpleExplanation": "one or two plain sentences explaining the concept simply",
  "keyVocabulary": ["word1", "word2", "word3", "word4", "word5"],
  "sentenceFrames": ["frame one ____.", "frame two ____.", "frame three ____."],
  "quickActivity": "a short 2-3 minute activity teachers can do right now",
  "extensionQuestion": "one deeper thinking question for students who are ready",
  "teacherMove": "one specific concrete thing the teacher should do or say right now"
}`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-5-mini",
      max_completion_tokens: 4096,
      messages: [
        {
          role: "system",
          content:
            "You are an expert elementary EAL teacher. Give practical, short, immediately usable classroom support. Always return valid JSON only — no markdown, no code blocks.",
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

    let support: unknown;
    try {
      support = JSON.parse(content);
    } catch {
      req.log.error({ content }, "Failed to parse AI response as JSON");
      res.status(500).json({ error: "Failed to parse support response" });
      return;
    }

    res.json(support);
  } catch (err) {
    req.log.error({ err }, "Error generating classroom support");
    res.status(500).json({ error: "Failed to generate classroom support" });
  }
});

export default router;
