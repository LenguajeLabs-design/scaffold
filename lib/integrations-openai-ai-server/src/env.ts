function readEnv(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value ? value : undefined;
}

export function getOpenAIConfig(): { apiKey: string; baseURL?: string } {
  const apiKey =
    readEnv("OPENAI_API_KEY") ?? readEnv("AI_INTEGRATIONS_OPENAI_API_KEY");

  if (!apiKey) {
    throw new Error(
      "OPENAI_API_KEY must be set. You can also use AI_INTEGRATIONS_OPENAI_API_KEY for the Replit proxy.",
    );
  }

  const baseURL =
    readEnv("OPENAI_BASE_URL") ?? readEnv("AI_INTEGRATIONS_OPENAI_BASE_URL");

  return baseURL ? { apiKey, baseURL } : { apiKey };
}
