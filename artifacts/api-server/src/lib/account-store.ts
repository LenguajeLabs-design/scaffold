import { pool } from "@workspace/db";
import type { Actor } from "./auth";

export interface SavedAccountLesson {
  id: string;
  savedAt: string;
  title: string;
  gradeLevel: string;
  languageSupportLevel: string;
  topic: string;
  unitProfile?: string;
  lesson: Record<string, unknown>;
}

export interface AccountProfile {
  id: string;
  email: string;
  marketingOptIn: boolean;
}

export interface AccountLessonInput {
  id: string;
  title: string;
  gradeLevel: string;
  languageSupportLevel: string;
  topic: string;
  unitProfile?: string;
  lesson: Record<string, unknown>;
  marketingOptIn?: boolean;
}

export async function initializeAccountStore(): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS scaffold_accounts (
      id text PRIMARY KEY,
      email text NOT NULL,
      marketing_opt_in boolean NOT NULL DEFAULT false,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    );
    CREATE TABLE IF NOT EXISTS scaffold_saved_lessons (
      account_id text NOT NULL REFERENCES scaffold_accounts(id) ON DELETE CASCADE,
      client_id text NOT NULL,
      title text NOT NULL,
      grade_level text NOT NULL,
      language_support_level text NOT NULL,
      topic text NOT NULL,
      unit_profile text,
      lesson jsonb NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now(),
      PRIMARY KEY (account_id, client_id)
    );
    CREATE INDEX IF NOT EXISTS scaffold_saved_lessons_account_time
      ON scaffold_saved_lessons(account_id, updated_at DESC);
  `);
}

export async function upsertAccount(
  actor: Actor,
  marketingOptIn = false,
): Promise<AccountProfile> {
  if (!actor.email) throw new Error("A verified account email is required");

  const { rows: [account] } = await pool.query<AccountProfile>(
    `
      INSERT INTO scaffold_accounts (id, email, marketing_opt_in)
      VALUES ($1, $2, $3)
      ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        marketing_opt_in = scaffold_accounts.marketing_opt_in OR EXCLUDED.marketing_opt_in,
        updated_at = now()
      RETURNING id, email, marketing_opt_in AS "marketingOptIn"
    `,
    [actor.id, actor.email, marketingOptIn],
  );

  return account;
}

export async function listAccountLessons(
  actor: Actor,
): Promise<SavedAccountLesson[]> {
  const { rows } = await pool.query<SavedAccountLesson>(
    `
      SELECT
        client_id AS id,
        updated_at AS "savedAt",
        title,
        grade_level AS "gradeLevel",
        language_support_level AS "languageSupportLevel",
        topic,
        unit_profile AS "unitProfile",
        lesson
      FROM scaffold_saved_lessons
      WHERE account_id = $1
      ORDER BY updated_at DESC
    `,
    [actor.id],
  );

  return rows;
}

export async function saveAccountLesson(
  actor: Actor,
  input: AccountLessonInput,
): Promise<SavedAccountLesson> {
  const { rows: [lesson] } = await pool.query<SavedAccountLesson>(
    `
      INSERT INTO scaffold_saved_lessons (
        account_id,
        client_id,
        title,
        grade_level,
        language_support_level,
        topic,
        unit_profile,
        lesson
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb)
      ON CONFLICT (account_id, client_id) DO UPDATE SET
        title = EXCLUDED.title,
        grade_level = EXCLUDED.grade_level,
        language_support_level = EXCLUDED.language_support_level,
        topic = EXCLUDED.topic,
        unit_profile = EXCLUDED.unit_profile,
        lesson = EXCLUDED.lesson,
        updated_at = now()
      RETURNING
        client_id AS id,
        updated_at AS "savedAt",
        title,
        grade_level AS "gradeLevel",
        language_support_level AS "languageSupportLevel",
        topic,
        unit_profile AS "unitProfile",
        lesson
    `,
    [
      actor.id,
      input.id,
      input.title,
      input.gradeLevel,
      input.languageSupportLevel,
      input.topic,
      input.unitProfile ?? null,
      JSON.stringify(input.lesson),
    ],
  );

  return lesson;
}
