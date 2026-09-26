import { Router, type IRouter, type Response } from "express";
import { GenerateLessonPlanResponse } from "@workspace/api-zod";
import { AccessError, authenticate, type Actor } from "../lib/auth";
import {
  listAccountLessons,
  saveAccountLesson,
  upsertAccount,
} from "../lib/account-store";
import { logUsage } from "../lib/usage-logger";

const router: IRouter = Router();

function textField(value: unknown, max: number, required = true): string | undefined {
  if (typeof value !== "string") return required ? undefined : "";
  const normalized = value.trim();
  if (required && !normalized) return undefined;
  return normalized.length <= max ? normalized : undefined;
}

function parseSavedLessonBody(body: unknown) {
  if (!body || typeof body !== "object") return null;
  const record = body as Record<string, unknown>;
  const id = textField(record.id, 80);
  const title = textField(record.title, 200);
  const gradeLevel = textField(record.gradeLevel, 50);
  const languageSupportLevel = textField(record.languageSupportLevel, 10);
  const topic = textField(record.topic, 200);
  const unitProfile = textField(record.unitProfile, 200, false) || undefined;
  const lesson = GenerateLessonPlanResponse.safeParse(record.lesson);
  if (
    !id ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id) ||
    !title ||
    !gradeLevel ||
    !languageSupportLevel ||
    topic === undefined ||
    !lesson.success ||
    (record.marketingOptIn !== undefined && typeof record.marketingOptIn !== "boolean")
  ) {
    return null;
  }
  return {
    id,
    title,
    gradeLevel,
    languageSupportLevel,
    topic,
    unitProfile,
    lesson: lesson.data,
    marketingOptIn: record.marketingOptIn === true,
  };
}

function sendAccountError(res: Response, error: unknown) {
  if (error instanceof AccessError) {
    res.status(401).json({ error: error.message });
    return;
  }
  res.status(503).json({ error: "Your account could not be reached. Please try again." });
}

router.get("/account/lessons", async (req, res) => {
  let actor: Actor | undefined;
  try {
    actor = await authenticate(req, { requireAccount: true });
    const account = await upsertAccount(actor);
    const lessons = await listAccountLessons(actor);
    res.set("Cache-Control", "no-store");
    res.json({
      account: {
        email: account.email,
        marketingOptIn: account.marketingOptIn,
      },
      lessons,
    });
  } catch (error) {
    logUsage({ feature: "access", event: "blocked", actor: actor?.id, reason: "account" });
    sendAccountError(res, error);
  }
});

router.post("/account/lessons", async (req, res) => {
  let actor: Actor | undefined;
  try {
    actor = await authenticate(req, { requireAccount: true });
    const input = parseSavedLessonBody(req.body);
    if (!input) {
      res.status(400).json({ error: "That lesson could not be saved. Please refresh and try again." });
      return;
    }

    const account = await upsertAccount(actor, input.marketingOptIn);
    const lesson = await saveAccountLesson(actor, input);
    res.set("Cache-Control", "no-store");
    res.json({
      account: {
        email: account.email,
        marketingOptIn: account.marketingOptIn,
      },
      lesson,
    });
  } catch (error) {
    logUsage({ feature: "access", event: "blocked", actor: actor?.id, reason: "account_save" });
    sendAccountError(res, error);
  }
});

export default router;
