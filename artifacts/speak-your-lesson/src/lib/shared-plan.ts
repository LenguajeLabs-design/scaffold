import type { LessonPlan } from "@workspace/api-client-react";

const SHARE_VERSION = 1;
const MAX_ENCODED_LENGTH = 100_000;

export interface SharedPlanSnapshot {
  lesson: LessonPlan;
  gradeLevel: string;
  widaBand: string;
  topic: string;
  unitProfile?: string;
}

interface ShareEnvelope {
  version: number;
  plan: SharedPlanSnapshot;
}

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = "";
  const chunkSize = 8192;
  for (let offset = 0; offset < bytes.length; offset += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + chunkSize));
  }
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function base64UrlToBytes(value: string): Uint8Array {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
  const binary = atob(padded);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  return copy.buffer;
}

async function compress(bytes: Uint8Array): Promise<Uint8Array> {
  if (typeof CompressionStream === "undefined") return bytes;
  const stream = new Blob([toArrayBuffer(bytes)])
    .stream()
    .pipeThrough(new CompressionStream("gzip"));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

async function decompress(
  bytes: Uint8Array,
  compressed: boolean,
): Promise<Uint8Array> {
  if (!compressed) return bytes;
  if (typeof DecompressionStream === "undefined") {
    throw new Error("This browser cannot open compressed plan links.");
  }
  const stream = new Blob([toArrayBuffer(bytes)])
    .stream()
    .pipeThrough(new DecompressionStream("gzip"));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function isLessonPlan(value: unknown): value is LessonPlan {
  if (!value || typeof value !== "object") return false;
  const lesson = value as Record<string, unknown>;
  const stringFields = [
    "title",
    "integratedUnitGoal",
    "contentObjective",
    "languageObjective",
    "languageFunctionObjective",
    "languageFeatureObjective",
    "warmUp",
    "mainActivity",
    "speakingActivity",
    "exitTicket",
    "teacherNotes",
    "scaffoldPlan",
    "scaffoldFadingPlan",
    "formativeAssessment",
  ];

  return (
    stringFields.every((field) => typeof lesson[field] === "string") &&
    isStringArray(lesson.keyVocabulary) &&
    isStringArray(lesson.sentenceFrames) &&
    isStringArray(lesson.sourcesUsed)
  );
}

function isSharedPlanSnapshot(value: unknown): value is SharedPlanSnapshot {
  if (!value || typeof value !== "object") return false;
  const plan = value as Record<string, unknown>;
  return (
    isLessonPlan(plan.lesson) &&
    typeof plan.gradeLevel === "string" &&
    typeof plan.widaBand === "string" &&
    typeof plan.topic === "string" &&
    (plan.unitProfile === undefined || typeof plan.unitProfile === "string")
  );
}

export async function encodeSharedPlan(
  plan: SharedPlanSnapshot,
): Promise<string> {
  const envelope: ShareEnvelope = { version: SHARE_VERSION, plan };
  const bytes = new TextEncoder().encode(JSON.stringify(envelope));
  const compressed = typeof CompressionStream !== "undefined";
  const encoded = bytesToBase64Url(await compress(bytes));
  return `${compressed ? "g" : "u"}.${encoded}`;
}

export async function decodeSharedPlan(
  encoded: string,
): Promise<SharedPlanSnapshot | null> {
  if (!encoded || encoded.length > MAX_ENCODED_LENGTH) return null;

  try {
    const separator = encoded.indexOf(".");
    if (separator < 1) return null;
    const mode = encoded.slice(0, separator);
    if (mode !== "g" && mode !== "u") return null;

    const bytes = base64UrlToBytes(encoded.slice(separator + 1));
    const decoded = await decompress(bytes, mode === "g");
    const envelope = JSON.parse(
      new TextDecoder().decode(decoded),
    ) as Partial<ShareEnvelope>;

    if (envelope.version !== SHARE_VERSION) return null;
    return isSharedPlanSnapshot(envelope.plan) ? envelope.plan : null;
  } catch {
    return null;
  }
}
