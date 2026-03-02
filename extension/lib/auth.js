/**
 * FlowPulse Extension — Auth with token refresh
 *
 * For development: stores a Firebase ID token + refresh token.
 * On sign-in, we initialize with a server-generated token.
 * The refresh token auto-renews the ID token every hour.
 */

import { FIREBASE_CONFIG } from "./firebase.js";

const AUTH_STORAGE_KEY = "flowpulse_auth";

// Pre-generated refresh token (from scripts/get-token.cjs)
const INITIAL_REFRESH_TOKEN = "AMf-vByOTzKwCa8OYnjihVgPICO2_h8iZ9GKkfvbXx2D3Jstv9DDV4cXqcPRAt6yZyuxbJsG63utuNAs0d_i9vx6xb3qoYWE5WZAFeEsujzkSeddWPpwhoNtTQPfqTDiyVMyc2ivADH1-cmKOEt_5a1nh-y0R652HxE-PWKGbuXf31ylZtz0YTgtGAubhqQcWs4IMfnFSx3D";

/**
 * Sign in — gets a fresh ID token via the refresh token
 */
export async function signIn() {
  const authData = await refreshToken(INITIAL_REFRESH_TOKEN);
  if (!authData) throw new Error("Failed to sign in — could not refresh token");
  return authData;
}

/**
 * Sign out — clear stored auth
 */
export async function signOut() {
  await chrome.storage.local.remove(AUTH_STORAGE_KEY);
  console.log("[FlowPulse] Signed out");
}

/**
 * Get current auth state, auto-refreshing if expired
 */
export async function getAuth() {
  const result = await chrome.storage.local.get(AUTH_STORAGE_KEY);
  const auth = result[AUTH_STORAGE_KEY];

  if (!auth) return null;

  // Refresh if expired or about to expire (1 min buffer)
  if (auth.expiresAt && Date.now() > auth.expiresAt - 60000) {
    const refreshed = await refreshToken(auth.refreshToken || INITIAL_REFRESH_TOKEN);
    if (refreshed) return refreshed;
    await signOut();
    return null;
  }

  return auth;
}

/**
 * Refresh the Firebase ID token
 */
async function refreshToken(token) {
  if (!token) return null;

  try {
    const response = await fetch(
      `https://securetoken.googleapis.com/v1/token?key=${FIREBASE_CONFIG.apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          grant_type: "refresh_token",
          refresh_token: token,
        }),
      }
    );

    const data = await response.json();
    if (data.error) {
      console.error("[FlowPulse] Token refresh error:", data.error);
      return null;
    }

    const authData = {
      token: data.id_token,
      refreshToken: data.refresh_token,
      uid: data.user_id,
      email: "dodgehellcatansh@gmail.com",
      displayName: "ansh yadav",
      photoURL: "",
      expiresAt: Date.now() + parseInt(data.expires_in) * 1000,
    };

    await chrome.storage.local.set({ [AUTH_STORAGE_KEY]: authData });
    console.log("[FlowPulse] Token refreshed, expires in", data.expires_in, "seconds");
    return authData;
  } catch (err) {
    console.error("[FlowPulse] Token refresh failed:", err);
    return null;
  }
}
