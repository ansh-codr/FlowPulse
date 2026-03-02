/**
 * FlowPulse Extension — Auth Module (Production-Ready)
 *
 * Auth flow:
 * 1. User signs in on the FlowPulse dashboard (Google sign-in)
 * 2. Content script on the dashboard reads Firebase auth from IndexedDB
 * 3. Auth data (including refresh token) is sent here and stored
 * 4. This module auto-refreshes the ID token before every Firestore call
 *
 * No hardcoded tokens. No manual token generation. Works for all users.
 */

import { FIREBASE_CONFIG } from "./firebase.js";

const AUTH_STORAGE_KEY = "flowpulse_auth";

/**
 * Store auth data received from dashboard content script.
 */
export async function storeAuth(data) {
  if (!data.uid || !data.refreshToken) {
    console.warn("[FlowPulse] Cannot store auth: missing uid or refreshToken");
    return null;
  }

  const authData = {
    token: data.accessToken || "",
    refreshToken: data.refreshToken,
    uid: data.uid,
    email: data.email || "",
    displayName: data.displayName || "",
    photoURL: data.photoURL || "",
    expiresAt: data.expirationTime || Date.now() + 3600000,
  };

  await chrome.storage.local.set({ [AUTH_STORAGE_KEY]: authData });
  console.log("[FlowPulse] Auth stored for:", authData.email);
  return authData;
}

/**
 * Sign in — opens dashboard for Google sign-in.
 * Content script on the dashboard will pick up auth automatically.
 */
export async function signIn() {
  chrome.tabs.create({ url: "https://anshyadav.tech/login" });
}

/**
 * Sign out — clear stored auth.
 */
export async function signOut() {
  await chrome.storage.local.remove(AUTH_STORAGE_KEY);
  console.log("[FlowPulse] Signed out");
}

/**
 * Get current auth state, auto-refreshing the ID token if expired.
 * Returns auth object or null if not signed in.
 */
export async function getAuth() {
  const result = await chrome.storage.local.get(AUTH_STORAGE_KEY);
  const auth = result[AUTH_STORAGE_KEY];

  if (!auth || !auth.refreshToken) return null;

  // Token is still valid (with 2 min buffer)
  if (auth.token && auth.expiresAt && Date.now() < auth.expiresAt - 120000) {
    return auth;
  }

  // Token expired or missing — refresh it
  console.log("[FlowPulse] Token expired, refreshing...");
  const refreshed = await refreshIdToken(auth.refreshToken);
  if (refreshed) return refreshed;

  // Refresh failed — don't sign out immediately, might be temporary
  console.warn("[FlowPulse] Token refresh failed, will retry later");
  return null;
}

/**
 * Check if signed in (quick, no refresh).
 */
export async function isSignedIn() {
  const result = await chrome.storage.local.get(AUTH_STORAGE_KEY);
  return !!result[AUTH_STORAGE_KEY]?.uid;
}

/**
 * Refresh Firebase ID token using the refresh token.
 */
async function refreshIdToken(refreshToken) {
  if (!refreshToken) return null;

  try {
    const response = await fetch(
      `https://securetoken.googleapis.com/v1/token?key=${FIREBASE_CONFIG.apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          grant_type: "refresh_token",
          refresh_token: refreshToken,
        }),
      }
    );

    const data = await response.json();
    if (data.error) {
      console.error("[FlowPulse] Token refresh error:", data.error);
      return null;
    }

    // Preserve existing display info
    const stored = await chrome.storage.local.get(AUTH_STORAGE_KEY);
    const existing = stored[AUTH_STORAGE_KEY] || {};

    const authData = {
      ...existing,
      token: data.id_token,
      refreshToken: data.refresh_token, // Firebase may rotate refresh tokens
      uid: data.user_id,
      expiresAt: Date.now() + parseInt(data.expires_in) * 1000,
    };

    await chrome.storage.local.set({ [AUTH_STORAGE_KEY]: authData });
    console.log("[FlowPulse] Token refreshed, expires in", data.expires_in, "s");
    return authData;
  } catch (err) {
    console.error("[FlowPulse] Token refresh failed:", err);
    return null;
  }
}
