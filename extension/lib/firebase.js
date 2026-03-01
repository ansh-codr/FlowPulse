/**
 * FlowPulse Extension — Firebase initialization
 *
 * Uses the Firebase compat SDK for service worker compatibility.
 * Config is injected at build time or hardcoded for development.
 */

// Firebase config — replace with your project values
const FIREBASE_CONFIG = {
  apiKey: "__FIREBASE_API_KEY__",
  authDomain: "__FIREBASE_AUTH_DOMAIN__",
  projectId: "__FIREBASE_PROJECT_ID__",
  storageBucket: "__FIREBASE_STORAGE_BUCKET__",
  messagingSenderId: "__FIREBASE_MESSAGING_SENDER_ID__",
  appId: "__FIREBASE_APP_ID__",
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
 * Write activity logs to Firestore via REST API (batched)
 */
export async function writeActivityLogs(uid, logs) {
  const token = await getAuthToken();
  if (!token || !uid || logs.length === 0) return false;

  try {
    // Use batch commit via REST
    const writes = logs.map((log) => ({
      update: {
        name: `projects/${FIREBASE_CONFIG.projectId}/databases/(default)/documents/users/${uid}/activityLogs/${log.id}`,
        fields: {
          url: { stringValue: log.url },
          domain: { stringValue: log.domain },
          title: { stringValue: log.title },
          category: { stringValue: log.category },
          startTime: { timestampValue: log.startTime },
          endTime: { timestampValue: log.endTime },
          duration: { integerValue: String(log.duration) },
        },
      },
    }));

    const response = await fetch(
      `https://firestore.googleapis.com/v1/projects/${FIREBASE_CONFIG.projectId}/databases/(default)/documents:batchWrite`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ writes }),
      }
    );

    return response.ok;
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
