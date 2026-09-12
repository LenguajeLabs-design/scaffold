import { createHmac } from "node:crypto";
import { OAuth2Client, type TokenPayload } from "google-auth-library";
import type { Request } from "express";
import { isValidCode } from "./access-codes";

const google = new OAuth2Client();
export interface Actor { id: string; admin: boolean }
export class AccessError extends Error {}
export function privateHash(kind: string, value: string): string {
  const secret = process.env.USAGE_HASH_SECRET;
  if (!secret || secret.length < 32) throw new Error("USAGE_HASH_SECRET must contain at least 32 characters");
  return createHmac("sha256", secret).update(`${kind}:${value}`).digest("hex");
}
export function actorFromClaims(claims: TokenPayload): Actor {
  if (!claims.sub || !claims.email || claims.email_verified !== true) throw new AccessError("Sign in with a verified Google account.");
  const email = claims.email.toLowerCase();
  const allowlist = (process.env.ADMIN_EMAILS ?? "").split(",").map(e => e.trim().toLowerCase()).filter(Boolean);
  // Google must be authoritative for the email before email-based privilege is granted.
  const authoritativeEmail = email.endsWith("@gmail.com") || Boolean(claims.hd);
  return { id: privateHash("google-sub", claims.sub), admin: authoritativeEmail && allowlist.includes(email) };
}
export async function authenticate(req: Request): Promise<Actor> {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) throw new Error("GOOGLE_CLIENT_ID is required");
  const authorization = req.get("authorization") ?? "";
  if (!/^Bearer [A-Za-z0-9._-]{100,8192}$/.test(authorization)) throw new AccessError("Please sign in with Google to generate lessons.");
  let claims: TokenPayload | undefined;
  try {
    const ticket = await google.verifyIdToken({ idToken: authorization.slice(7), audience: clientId });
    claims = ticket.getPayload();
  } catch {
    throw new AccessError("Your sign-in has expired or is invalid. Please sign in again.");
  }
  if (!claims) throw new AccessError("Please sign in again.");
  const actor = actorFromClaims(claims);
  if (!actor.admin && !isValidCode(req.body?.accessCode)) throw new AccessError("Invalid or missing beta access code.");
  return actor;
}
