import { randomUUID } from "node:crypto";
import { pool } from "@workspace/db";
import { beta, dailyMessage, LEASE_SECONDS } from "../config/beta";
import type { Actor } from "./auth";

export class UsageLimit extends Error {
  constructor(public reason: string, message: string, public retryAfter = 60, public status = 429) { super(message); }
}
export async function initializeUsageStore(): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS beta_usage_totals (
      bucket text PRIMARY KEY, calls bigint NOT NULL DEFAULT 0, tokens bigint NOT NULL DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS beta_generation_requests (
      id uuid PRIMARY KEY, actor text NOT NULL, ip_hash text NOT NULL,
      request_key text NOT NULL, fingerprint text NOT NULL, admin boolean NOT NULL,
      started_at timestamptz NOT NULL DEFAULT now(), finished_at timestamptz,
      outcome text, reserved_tokens integer NOT NULL, input_tokens integer, output_tokens integer
    );
    CREATE INDEX IF NOT EXISTS beta_requests_actor_time ON beta_generation_requests(actor, started_at);
    CREATE INDEX IF NOT EXISTS beta_requests_ip_time ON beta_generation_requests(ip_hash, started_at);
  `);
}

// The single transaction lock serializes only short admission decisions across all replicas.
// Counters are committed BEFORE any paid call. Failures/timeouts never refund reservations.
export async function reserve(actor: Actor, ipHash: string, key: string, fingerprint: string, tokens: number): Promise<string> {
  if (process.env.GENERATION_ENABLED !== "true") throw new UsageLimit("disabled", "Scaffold generation is temporarily paused. Please try again later.", 300, 503);
  const db = await pool.connect();
  try {
    await db.query("BEGIN");
    await db.query("SET LOCAL lock_timeout = '3s'");
    await db.query("SET LOCAL statement_timeout = '5s'");
    await db.query("SELECT pg_advisory_xact_lock(739124001)");
    const { rows: [clock] } = await db.query("SELECT now() AS now, to_char(now() AT TIME ZONE 'UTC', 'YYYY-MM-DD') AS day, date_trunc('day', now() AT TIME ZONE 'UTC') AT TIME ZONE 'UTC' AS midnight");
    const now = new Date(clock.now).getTime();
    // Keep a small rolling window for duplicate detection and privacy-safe
    // operational investigation. This is metadata only; prompts are never stored.
    await db.query("DELETE FROM beta_generation_requests WHERE started_at < now() - interval '7 days'");
    const { rows: previous } = await db.query(`SELECT request_key, fingerprint, started_at, finished_at FROM beta_generation_requests WHERE actor = $1 ORDER BY started_at DESC`, [actor.id]);
    if (previous.some(p => p.request_key === key || (p.fingerprint === fingerprint && now - new Date(p.started_at).getTime() < beta.duplicateSeconds * 1000))) {
      throw new UsageLimit("duplicate", "This request was already submitted. Check the existing result or wait before trying the same request again.", beta.duplicateSeconds, 409);
    }
    const active = previous.some(p => !p.finished_at && now - new Date(p.started_at).getTime() < LEASE_SECONDS * 1000);
    if (active) throw new UsageLimit("in_flight", "Your previous generation is still running. Please wait for it to finish.", 10, 409);
    const countToday = previous.filter(p => new Date(p.started_at) >= new Date(clock.midnight)).length;
    if (!actor.admin && countToday >= beta.dailyLimit) {
      throw new UsageLimit("daily_limit", dailyMessage, Math.ceil((new Date(clock.midnight).getTime() + 86400000 - now) / 1000));
    }
    const cooldown = (actor.admin ? beta.adminCooldownSeconds : beta.cooldownSeconds) * 1000;
    if (previous[0] && now - new Date(previous[0].started_at).getTime() < cooldown) {
      const wait = Math.ceil((cooldown - now + new Date(previous[0].started_at).getTime()) / 1000);
      throw new UsageLimit("cooldown", `Please wait ${wait} seconds before generating again.`, wait);
    }
    const { rows: [ip] } = await db.query("SELECT count(*)::int AS count FROM beta_generation_requests WHERE ip_hash = $1 AND started_at >= $2", [ipHash, clock.midnight]);
    if (!actor.admin && ip.count >= beta.ipDailyLimit) throw new UsageLimit("ip_limit", "This connection has reached the beta allowance. Please contact Federico for additional access.", 3600);
    const { rows: [inFlight] } = await db.query("SELECT count(*)::int AS count FROM beta_generation_requests WHERE finished_at IS NULL AND started_at > now() - $1 * interval '1 second'", [LEASE_SECONDS]);
    if (inFlight.count >= beta.concurrency) throw new UsageLimit("capacity", "Scaffold is helping other teachers. Please try again in a moment.", 15);
    const buckets = [`day:${clock.day}`, "lifetime"];
    for (const [index, bucket] of buckets.entries()) {
      await db.query("INSERT INTO beta_usage_totals(bucket) VALUES ($1) ON CONFLICT DO NOTHING", [bucket]);
      const { rows: [total] } = await db.query("SELECT calls, tokens FROM beta_usage_totals WHERE bucket = $1", [bucket]);
      const callLimit = index === 0 ? beta.globalDailyLimit : beta.globalLifetimeLimit;
      const tokenLimit = index === 0 ? beta.globalDailyTokens : beta.globalLifetimeTokens;
      if (Number(total.calls) >= callLimit || Number(total.tokens) + tokens > tokenLimit) throw new UsageLimit("global_ceiling", "Scaffold's beta capacity has been reached. Please contact Federico or try again later.", 3600, 503);
      await db.query("UPDATE beta_usage_totals SET calls = calls + 1, tokens = tokens + $2 WHERE bucket = $1", [bucket, tokens]);
    }
    const id = randomUUID();
    await db.query("INSERT INTO beta_generation_requests(id, actor, ip_hash, request_key, fingerprint, admin, reserved_tokens) VALUES ($1,$2,$3,$4,$5,$6,$7)", [id, actor.id, ipHash, key, fingerprint, actor.admin, tokens]);
    await db.query("COMMIT");
    return id;
  } catch (error) {
    await db.query("ROLLBACK");
    throw error;
  } finally { db.release(); }
}
export async function finish(id: string, outcome: "completed" | "failed", usage?: { prompt_tokens: number; completion_tokens: number }): Promise<void> {
  await pool.query("UPDATE beta_generation_requests SET finished_at = now(), outcome = $2, input_tokens = $3, output_tokens = $4 WHERE id = $1", [id, outcome, usage?.prompt_tokens ?? null, usage?.completion_tokens ?? null]);
}
