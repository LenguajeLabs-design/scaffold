import { Router, type IRouter } from "express";
import { authenticate, AccessError } from "../lib/auth";
import { beta } from "../config/beta";
import { logUsage } from "../lib/usage-logger";
const router: IRouter = Router();
router.get("/access/config", (_req, res) => {
  res.set("Cache-Control", "no-store");
  // A Google OAuth client ID is intentionally public. It identifies the app,
  // while server-side ID-token verification enforces authentication.
  res.json({ googleClientId: process.env.GOOGLE_CLIENT_ID ?? null, dailyLimit: beta.dailyLimit });
});
router.post("/access/validate", async (req, res) => {
  res.set("Cache-Control", "no-store");
  try {
    const actor = await authenticate(req);
    res.json({ valid: true, admin: actor.admin, dailyLimit: actor.admin ? null : beta.dailyLimit });
  } catch (error) {
    logUsage({ feature: "access", event: "blocked", reason: error instanceof AccessError ? "auth" : "configuration" });
    res.status(error instanceof AccessError ? 401 : 503).json({ error: error instanceof AccessError ? error.message : "Sign-in is temporarily unavailable." });
  }
});
export default router;
