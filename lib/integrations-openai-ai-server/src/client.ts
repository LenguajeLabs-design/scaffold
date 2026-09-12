import OpenAI from "openai";
import { getOpenAIConfig } from "./env";

export const openai = new OpenAI({
  ...getOpenAIConfig(),
  maxRetries: 0,
  timeout: 90_000,
});
