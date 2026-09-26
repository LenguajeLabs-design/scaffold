import { Router, type IRouter, type Response } from "express";
import { AccessError, authenticate, type Actor } from "../lib/auth";
import { listAdminAccounts } from "../lib/account-store";
import { logUsage } from "../lib/usage-logger";

const router: IRouter = Router();

function sendAdminError(res: Response, error: unknown) {
  if (error instanceof AccessError) {
    res.status(401).json({ error: error.message });
    return;
  }

  if (error instanceof Error && error.message === "Admin access required.") {
    res.status(403).json({ error: error.message });
    return;
  }

  res.status(503).json({ error: "The admin account list could not be reached." });
}

router.get("/admin/accounts", async (req, res) => {
  let actor: Actor | undefined;
  try {
    actor = await authenticate(req, { requireAccount: true });
    if (!actor.admin) {
      throw new Error("Admin access required.");
    }

    const result = await listAdminAccounts();
    res.set("Cache-Control", "no-store");
    res.json(result);
  } catch (error) {
    logUsage({ feature: "access", event: "blocked", actor: actor?.id, reason: "admin_accounts" });
    sendAdminError(res, error);
  }
});

export default router;
