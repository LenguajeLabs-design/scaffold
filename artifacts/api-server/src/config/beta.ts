export function integer(name: string, fallback: number, minimum = 1, maximum = 100_000_000): number {
  const raw = process.env[name];
  const value = raw === undefined ? fallback : Number(raw);
  if (!Number.isSafeInteger(value) || value < minimum || value > maximum) {
    throw new Error(`Invalid ${name} configuration`);
  }
  return value;
}

export const beta = {
  dailyLimit: integer("BETA_DAILY_LIMIT", 4),
  cooldownSeconds: integer("BETA_COOLDOWN_SECONDS", 30),
  adminCooldownSeconds: integer("ADMIN_COOLDOWN_SECONDS", 3),
  ipDailyLimit: integer("BETA_IP_DAILY_LIMIT", 40),
  globalDailyLimit: integer("GLOBAL_DAILY_GENERATION_LIMIT", 100),
  globalDailyTokens: integer("GLOBAL_DAILY_TOKEN_LIMIT", 1_000_000),
  globalLifetimeLimit: integer("GLOBAL_LIFETIME_GENERATION_LIMIT", 1_000),
  globalLifetimeTokens: integer("GLOBAL_LIFETIME_TOKEN_LIMIT", 10_000_000),
  concurrency: integer("GLOBAL_CONCURRENT_GENERATIONS", 3, 1, 20),
  duplicateSeconds: integer("GENERATION_DUPLICATE_SECONDS", 600, 120, 86400),
};
export const API_TIMEOUT_MS = 90_000;
export const LEASE_SECONDS = 180;
export const dailyMessage = `Scaffold is in beta, and you've reached today's allowance of ${beta.dailyLimit} generations. Your allowance resets at midnight UTC. Please contact Federico at forozc1@gmail.com for additional access.`;
