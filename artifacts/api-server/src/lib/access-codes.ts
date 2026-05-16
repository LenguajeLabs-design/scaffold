/**
 * Access code validation and per-code rate limiting.
 *
 * Valid codes are loaded from VALID_ACCESS_CODES (comma-separated secret).
 * Each code gets:
 *   - 3 AI generations per feature per day (resets at midnight UTC)
 *   - 30-second cooldown between requests (per feature, per code)
 *
 * "demo" is always a valid pseudo-code used client-side to access sample
 * responses without touching the AI — the server never sees it for real calls.
 */

interface CodeState {
  count: number;
  lastReset: string; // ISO date string (YYYY-MM-DD) in UTC
  lastRequest: number; // Date.now() ms
}

// Feature keys for tracking separate counters
export type FeatureKey = "lesson-plan" | "classroom-copilot";

// In-memory store: codeUpperCase -> featureKey -> state
// Fine for a single-process server; survives restarts by just resetting counts.
const store = new Map<string, Map<FeatureKey, CodeState>>();

const DAILY_LIMIT = 5;
const COOLDOWN_MS = 30 * 1000; // 30 seconds

function todayUTC(): string {
  return new Date().toISOString().slice(0, 10);
}

function validCodes(): Set<string> {
  const raw = process.env.VALID_ACCESS_CODES ?? "";
  return new Set(
    raw
      .split(",")
      .map((c) => c.trim().toUpperCase())
      .filter(Boolean),
  );
}

export function isValidCode(code: string): boolean {
  return validCodes().has(code.trim().toUpperCase());
}

export type RateLimitResult =
  | { allowed: true }
  | { allowed: false; reason: "daily_limit"; resetsAt: string }
  | { allowed: false; reason: "cooldown"; waitMs: number };

export function checkAndRecord(
  code: string,
  feature: FeatureKey,
): RateLimitResult {
  const key = code.trim().toUpperCase();
  const today = todayUTC();

  if (!store.has(key)) {
    store.set(key, new Map());
  }
  const codeMap = store.get(key)!;

  if (!codeMap.has(feature)) {
    codeMap.set(feature, { count: 0, lastReset: today, lastRequest: 0 });
  }
  const state = codeMap.get(feature)!;

  // Reset counter if it's a new UTC day
  if (state.lastReset !== today) {
    state.count = 0;
    state.lastReset = today;
    state.lastRequest = 0;
  }

  // Check cooldown
  const now = Date.now();
  const elapsed = now - state.lastRequest;
  if (state.lastRequest > 0 && elapsed < COOLDOWN_MS) {
    return { allowed: false, reason: "cooldown", waitMs: COOLDOWN_MS - elapsed };
  }

  // Check daily limit
  if (state.count >= DAILY_LIMIT) {
    return { allowed: false, reason: "daily_limit", resetsAt: "midnight UTC" };
  }

  // Record the request
  state.count += 1;
  state.lastRequest = now;

  return { allowed: true };
}

export function remainingToday(code: string, feature: FeatureKey): number {
  const key = code.trim().toUpperCase();
  const today = todayUTC();
  const state = store.get(key)?.get(feature);
  if (!state || state.lastReset !== today) return DAILY_LIMIT;
  return Math.max(0, DAILY_LIMIT - state.count);
}
