import { openai } from "@workspace/integrations-openai-ai-server";
import { API_TIMEOUT_MS } from "../config/beta";
import { privateHash, type Actor } from "../lib/auth";
import { reserve, finish } from "../lib/usage-store";
import { logUsage, type FeatureKey } from "../lib/usage-logger";

export interface OpenAICallOptions {
  model: string;
  maxTokens: number;
  systemPrompt: string;
  userPrompt: string;
  actor: Actor;
  ip: string;
  requestKey: string;
  feature: FeatureKey;
}
export async function callOpenAIForJSON<T>(options: OpenAICallOptions): Promise<T> {
  const { model, maxTokens, systemPrompt, userPrompt, actor, feature } = options;
  // UTF-8 bytes conservatively bound text tokens; add allowance for message framing.
  const inputBound = Buffer.byteLength(systemPrompt + userPrompt, "utf8") + 1024;
  if (inputBound > 40_000 || maxTokens > 8192) throw new Error("Prompt budget exceeded");
  const reservedTokens = inputBound + maxTokens;
  const fingerprint = privateHash("prompt", JSON.stringify([feature, model, systemPrompt, userPrompt]));
  const requestId = await reserve(actor, privateHash("ip", options.ip), privateHash("key", options.requestKey), fingerprint, reservedTokens);
  const event = { feature, actor: actor.id, traffic: actor.admin ? "admin_test" as const : "beta" as const, requestId, model };
  logUsage({ ...event, event: "reserved", reservedTokens });
  let usage: { prompt_tokens: number; completion_tokens: number; total_tokens: number } | undefined;
  let outcome: "completed" | "failed" = "failed";
  try {
    const completion = await openai.chat.completions.create({
      model, max_completion_tokens: maxTokens,
      messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }],
    }, { maxRetries: 0, timeout: API_TIMEOUT_MS });
    usage = completion.usage ?? undefined;
    const raw = completion.choices[0]?.message?.content;
    if (!raw) throw new Error("Empty response");
    const result = JSON.parse(raw) as T;
    outcome = "completed";
    return result;
  } finally {
    // Never log prompts, output, email, IP, access codes, or provider error bodies.
    // Aggregate token counts are retained for cost monitoring.
    logUsage({ ...event, event: outcome, reason: outcome === "failed" ? "provider_or_output_error" : undefined,
      inputTokens: usage?.prompt_tokens, outputTokens: usage?.completion_tokens, totalTokens: usage?.total_tokens });
    try { await finish(requestId, outcome, usage); }
    catch { logUsage({ ...event, event: "failed", reason: "usage_finalize_unavailable" }); }
  }
}
