import * as admin from "firebase-admin";
import { integrateMobileAnalyticsForDate } from "./analyticsIntegrationService";
import { MobileActivitySummaryRow, MobileDailySummaryInput } from "./types";

if (!admin.apps.length) admin.initializeApp();
const db = admin.firestore();

function mobileSummaryRef(uid: string, dateStr: string): FirebaseFirestore.DocumentReference {
  return db.doc(`users/${uid}/mobile_activity_summary/${dateStr}`);
}

function sanitizeDailySummary(summary: MobileDailySummaryInput): MobileDailySummaryInput {
  return {
    date: summary.date,
    step_count: Math.max(0, Math.round(summary.step_count)),
    active_minutes: Math.max(0, Math.round(summary.active_minutes)),
    activity_sessions: Math.max(0, Math.round(summary.activity_sessions)),
  };
}

export async function upsertMobileActivitySummary(uid: string, summary: MobileDailySummaryInput): Promise<void> {
  const sanitized = sanitizeDailySummary(summary);

  const payload: MobileActivitySummaryRow & { created_at: FirebaseFirestore.FieldValue } = {
    user_id: uid,
    date: sanitized.date,
    step_count: sanitized.step_count,
    active_minutes: sanitized.active_minutes,
    activity_sessions: sanitized.activity_sessions,
    created_at: admin.firestore.FieldValue.serverTimestamp(),
  };

  await mobileSummaryRef(uid, sanitized.date).set(payload, { merge: true });
  await integrateMobileAnalyticsForDate(uid, sanitized);
}

export async function upsertMobileActivitySummaries(uid: string, summaries: MobileDailySummaryInput[]): Promise<void> {
  for (const summary of summaries) {
    await upsertMobileActivitySummary(uid, summary);
  }
}
