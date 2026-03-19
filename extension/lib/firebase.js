/**
 * FlowPulse Extension — Firebase initialization
 *
 * Uses the Firebase compat SDK for service worker compatibility.
 * Config is injected at build time or hardcoded for development.
 */

// Firebase config
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyDtG3UyShHnsMq99TsUOrKb0LWWIBQ7V4M",
  authDomain: "flowpulse-698a3.firebaseapp.com",
  projectId: "flowpulse-698a3",
  messagingSenderId: "641591502705",
  appId: "1:641591502705:web:0bae21ddb15c00ebbbf8d0",
};

// We'll use the REST API directly instead of the SDK in service workers
// This avoids import issues with firebase in MV3 service workers

const FIRESTORE_BASE = `https://firestore.googleapis.com/v1/projects/${FIREBASE_CONFIG.projectId}/databases/(default)/documents`;

/**
 * Get the current auth token from storage
 */
export async function getAuthToken() {
  const result = await chrome.storage.local.get("flowpulse_auth");
  return result.flowpulse_auth?.token || null;
}

/**
 * Get the current user ID from storage
 */
export async function getUserId() {
  const result = await chrome.storage.local.get("flowpulse_auth");
  return result.flowpulse_auth?.uid || null;
}

/**
 * Upsert lightweight realtime activity for users/{uid}/dailyRealtime/{YYYY-MM-DD}.
 * This avoids heavy per-event writes and keeps Firestore usage free-tier friendly.
 */
export async function upsertDailyRealtimeSummary(uid, payload) {
  const token = await getAuthToken();
  if (!token || !uid || !payload?.date) return false;

  try {
    const docPath = `${FIRESTORE_BASE}/users/${uid}/dailyRealtime/${payload.date}`;

    const fields = {
      userId: { stringValue: uid },
      date: { stringValue: payload.date },
      steps: { integerValue: String(Math.max(0, Number(payload.steps || 0))) },
      activitySummary: {
        mapValue: {
          fields: {
            activeMinutes: { integerValue: String(Math.max(0, Number(payload.activitySummary?.activeMinutes || 0))) },
            productiveMinutes: { integerValue: String(Math.max(0, Number(payload.activitySummary?.productiveMinutes || 0))) },
            distractionCount: { integerValue: String(Math.max(0, Number(payload.activitySummary?.distractionCount || 0))) },
            focusScore: { integerValue: String(Math.max(0, Math.min(100, Number(payload.activitySummary?.focusScore || 0)))) },
            topDomain: { stringValue: String(payload.activitySummary?.topDomain || "—") },
            sessionCount: { integerValue: String(Math.max(0, Number(payload.activitySummary?.sessionCount || 0))) },
          },
        },
      },
      lastUpdated: { timestampValue: new Date().toISOString() },
    };

    const response = await fetch(docPath, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ fields }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(`${response.status}: ${JSON.stringify(err)}`);
    }

    return true;
  } catch (err) {
    console.error("[FlowPulse] Firestore lightweight write error:", err);
    return false;
  }
}

/**
 * Write activity logs to users/{uid}/activityLogs using Firestore REST.
 * Returns number of successful writes.
 */
export async function writeActivityLogs(uid, logs) {
  const token = await getAuthToken();
  if (!token || !uid || !Array.isArray(logs) || logs.length === 0) return 0;

  let successCount = 0;

  for (const log of logs) {
    try {
      const response = await fetch(`${FIRESTORE_BASE}/users/${uid}/activityLogs`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fields: {
            url: { stringValue: String(log.url || "") },
            domain: { stringValue: String(log.domain || "") },
            title: { stringValue: String(log.title || "") },
            category: { stringValue: String(log.category || "neutral") },
            startTime: { timestampValue: new Date(log.startTime).toISOString() },
            endTime: { timestampValue: new Date(log.endTime).toISOString() },
            duration: { integerValue: String(Math.max(0, Number(log.duration || 0))) },
          },
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(`${response.status}: ${JSON.stringify(err)}`);
      }

      successCount += 1;
    } catch (err) {
      console.error("[FlowPulse] Firestore activity log write error:", err);
    }
  }

  return successCount;
}

/**
 * Read user settings from Firestore
 */
export async function getUserSettings(uid) {
  const token = await getAuthToken();
  if (!token || !uid) return null;

  try {
    const response = await fetch(
      `${FIRESTORE_BASE}/users/${uid}/settings/preferences`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!response.ok) return null;
    const doc = await response.json();

    return {
      trackingEnabled: doc.fields?.trackingEnabled?.booleanValue ?? true,
      blockedDomains: (doc.fields?.blockedDomains?.arrayValue?.values || []).map(
        (v) => v.stringValue
      ),
      timezone: doc.fields?.timezone?.stringValue || "UTC",
    };
  } catch {
    return null;
  }
}

export { FIREBASE_CONFIG };
