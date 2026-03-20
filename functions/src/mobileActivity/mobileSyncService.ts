import * as admin from "firebase-admin";
import * as functions from "firebase-functions";
import { isIsoDate, MobileDailySummaryInput, ValidatedMobileIngestBody } from "./types";

if (!admin.apps.length) admin.initializeApp();

const ALLOWED_TOP_LEVEL_KEYS = new Set(["source", "consent", "summaries"]);
const ALLOWED_SUMMARY_KEYS = new Set(["date", "step_count", "active_minutes", "activity_sessions"]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getBearerToken(req: functions.https.Request): string {
  const authHeader = req.header("authorization") ?? req.header("Authorization") ?? "";
  if (!authHeader.startsWith("Bearer ")) {
    throw new functions.https.HttpsError("unauthenticated", "Missing Bearer token.");
  }
  return authHeader.slice("Bearer ".length).trim();
}

function rejectUnexpectedKeys(obj: Record<string, unknown>, allowed: Set<string>, location: string): void {
  for (const key of Object.keys(obj)) {
    if (!allowed.has(key)) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        `${location} contains unsupported field '${key}'. Only minimal activity fields are accepted.`
      );
    }
  }
}

function toSafeNumber(value: unknown, field: string, max: number): number {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
    throw new functions.https.HttpsError("invalid-argument", `${field} must be a non-negative number.`);
  }
  return Math.min(Math.round(value), max);
}

function validateSummary(input: unknown): MobileDailySummaryInput {
  if (!isRecord(input)) {
    throw new functions.https.HttpsError("invalid-argument", "Each summary must be an object.");
  }
  rejectUnexpectedKeys(input, ALLOWED_SUMMARY_KEYS, "summary");

  const date = input.date;
  if (typeof date !== "string" || !isIsoDate(date)) {
    throw new functions.https.HttpsError("invalid-argument", "summary.date must be YYYY-MM-DD.");
  }

  return {
    date,
    step_count: toSafeNumber(input.step_count, "summary.step_count", 200000),
    active_minutes: toSafeNumber(input.active_minutes, "summary.active_minutes", 1440),
    activity_sessions: toSafeNumber(input.activity_sessions, "summary.activity_sessions", 400),
  };
}

export async function authenticateMobileIngestRequest(req: functions.https.Request): Promise<string> {
  const token = getBearerToken(req);
  const decoded = await admin.auth().verifyIdToken(token);
  return decoded.uid;
}

export function validateMobileIngestRequestBody(body: unknown): ValidatedMobileIngestBody {
  if (!isRecord(body)) {
    throw new functions.https.HttpsError("invalid-argument", "Request body must be a JSON object.");
  }
  rejectUnexpectedKeys(body, ALLOWED_TOP_LEVEL_KEYS, "request body");

  if (body.source !== "google_health_connect") {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "source must be 'google_health_connect'."
    );
  }

  if (body.consent !== true) {
    throw new functions.https.HttpsError(
      "failed-precondition",
      "Explicit user consent is required before syncing Health Connect data."
    );
  }

  if (!Array.isArray(body.summaries) || body.summaries.length === 0) {
    throw new functions.https.HttpsError("invalid-argument", "summaries must be a non-empty array.");
  }

  if (body.summaries.length > 31) {
    throw new functions.https.HttpsError("invalid-argument", "At most 31 daily summaries are allowed per request.");
  }

  const summaries = body.summaries.map(validateSummary);

  return {
    source: "google_health_connect",
    consent: true,
    summaries,
  };
}
