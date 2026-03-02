/**
 * FlowPulse Extension — Firebase initialization
 *
 * Uses the Firebase compat SDK for service worker compatibility.
 * Config is injected at build time or hardcoded for development.
 */

// Firebase config
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyAj7-7d1ez68B4J4pHxZyz_Er4SOXiYuJ8",
  authDomain: "flowpulse-dc45a.firebaseapp.com",
  projectId: "flowpulse-dc45a",
  storageBucket: "flowpulse-dc45a.firebasestorage.app",
  messagingSenderId: "398649552926",
  appId: "1:398649552926:web:6dcb2f4f1ed80c0d69be0f",
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
 * Write activity logs to Firestore via REST API.
 * Uses individual createDocument calls (parallel) since batchWrite
 * has permission issues with security rules.
 */
export async function writeActivityLogs(uid, logs) {
  const token = await getAuthToken();
  if (!token || !uid || logs.length === 0) return false;

  try {
    const BASE = `https://firestore.googleapis.com/v1/projects/${FIREBASE_CONFIG.projectId}/databases/(default)/documents`;

    // Parallel individual creates — each succeeds/fails independently
    const results = await Promise.allSettled(
      logs.map(async (log) => {
        const response = await fetch(
          `${BASE}/users/${uid}/activityLogs?documentId=${encodeURIComponent(log.id)}`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              fields: {
                url: { stringValue: log.url },
                domain: { stringValue: log.domain },
                title: { stringValue: log.title || "" },
                category: { stringValue: log.category },
                startTime: { timestampValue: log.startTime },
                endTime: { timestampValue: log.endTime },
                duration: { integerValue: String(log.duration) },
              },
            }),
          }
        );
        if (!response.ok) {
          // 409 CONFLICT = doc already exists, that's fine (duplicate)
          if (response.status === 409) return true;
          const err = await response.json().catch(() => ({}));
          throw new Error(`${response.status}: ${JSON.stringify(err)}`);
        }
        return true;
      })
    );

    const successes = results.filter((r) => r.status === "fulfilled").length;
    const failures = results.filter((r) => r.status === "rejected");
    if (failures.length > 0) {
      console.warn(
        "[FlowPulse] Write:",
        successes,
        "ok,",
        failures.length,
        "failed"
      );
    }

    // Consider success if most writes went through
    return successes > logs.length / 2;
  } catch (err) {
    console.error("[FlowPulse] Firestore write error:", err);
    return false;
  }
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
