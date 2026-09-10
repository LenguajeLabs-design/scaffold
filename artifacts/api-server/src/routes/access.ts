import { Router, type IRouter } from "express";
import { isValidCode } from "../lib/access-codes";

const router: IRouter = Router();

// Validate access without consuming generation quota or calling OpenAI.
router.post("/access/validate", (req, res) => {
  const code = req.body?.accessCode;
  res.set("Cache-Control", "no-store");
  if (typeof code !== "string" || !code.trim() || !isValidCode(code)) {
    res.status(401).json({ error: "Invalid or missing access code." });
    return;
  }
  res.json({ valid: true });
});

export default router;
