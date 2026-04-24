/**
 * Shared wrapper around the OpenAI chat completions API.
 *
 * Both AI features (lesson planning and classroom support) share the same
 * request/response flow: call the API, extract the text content, parse it as
 * JSON, and surface a safe error if anything goes wrong. Centralising this
 * here means route handlers only need to supply the model, prompts, and token
 * budget — they never touch OpenAI or JSON.parse directly.
 */

import { openai } from "@workspace/integrations-openai-ai-server";
import { logger } from "../lib/logger";

export interface OpenAICallOptions {
  model: string;
  maxTokens: number;
  systemPrompt: string;
  userPrompt: string;
}

/**
 * Calls the OpenAI chat completions API and returns the parsed JSON response.
 *
 * @throws Error with a safe, user-facing message if the API call fails,
 *   returns empty content, or returns content that cannot be parsed as JSON.
 *   Raw AI output and stack traces are only written to the server log.
 */
export async function callOpenAIForJSON<T>(options: OpenAICallOptions): Promise<T> {
  const { model, maxTokens, systemPrompt, userPrompt } = options;

  const completion = await openai.chat.completions.create({
    model,
    max_completion_tokens: maxTokens,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
  });

  const rawContent = completion.choices[0]?.message?.content;

  if (!rawContent) {
    throw new Error("The AI returned an empty response.");
  }

  try {
    return JSON.parse(rawContent) as T;
  } catch {
    // Log the raw content for debugging. Do not surface it to the client —
    // it may contain partial or unexpected output.
    logger.error({ rawContent }, "OpenAI returned content that could not be parsed as JSON");
    throw new Error("The AI response could not be parsed. Please try again.");
  }
}
