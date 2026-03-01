/**
 * FlowPulse Extension — Authentication via chrome.identity
 *
 * Uses Google OAuth2 via chrome.identity.launchWebAuthFlow
 * and exchanges the token for a Firebase Auth session.
 */

import { FIREBASE_CONFIG } from "./firebase.js";

const AUTH_STORAGE_KEY = "flowpulse_auth";

/**
 * Sign in with Google via chrome.identity
 */
export async function signIn() {
  try {
    // Use chrome.identity to get OAuth2 token
    const redirectUrl = chrome.identity.getRedirectURL("callback");
    const clientId = FIREBASE_CONFIG.apiKey; // Note: for production, use OAuth client ID

    const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    authUrl.searchParams.set("client_id", `${FIREBASE_CONFIG.messagingSenderId}-xxxxx.apps.googleusercontent.com`);
    authUrl.searchParams.set("response_type", "token");
    authUrl.searchParams.set("redirect_uri", redirectUrl);
    authUrl.searchParams.set("scope", "openid email profile");

    const responseUrl = await chrome.identity.launchWebAuthFlow({
      url: authUrl.toString(),
      interactive: true,
    });

    // Extract token from redirect URL
    const url = new URL(responseUrl);
    const params = new URLSearchParams(url.hash.substring(1));
    const accessToken = params.get("access_token");

    if (!accessToken) throw new Error("No access token received");

    // Exchange Google token for Firebase token
    const firebaseResponse = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithIdp?key=${FIREBASE_CONFIG.apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postBody: `access_token=${accessToken}&providerId=google.com`,
          requestUri: redirectUrl,
          returnIdToken: true,
          returnSecureToken: true,
        }),
      }
    );

    const data = await firebaseResponse.json();

    if (data.error) throw new Error(data.error.message);

    // Store auth data
    const authData = {
      token: data.idToken,
      refreshToken: data.refreshToken,
      uid: data.localId,
      email: data.email,
      displayName: data.displayName || data.email,
      photoURL: data.photoUrl || "",
      expiresAt: Date.now() + parseInt(data.expiresIn) * 1000,
    };

    await chrome.storage.local.set({ [AUTH_STORAGE_KEY]: authData });

    return authData;
  } catch (err) {
    console.error("[FlowPulse] Sign-in error:", err);
    throw err;
  }
}

/**
 * Sign out — clear stored auth
 */
export async function signOut() {
  await chrome.storage.local.remove(AUTH_STORAGE_KEY);
}

/**
 * Get current auth state
 */
export async function getAuth() {
  const result = await chrome.storage.local.get(AUTH_STORAGE_KEY);
  const auth = result[AUTH_STORAGE_KEY];

  if (!auth) return null;

  // Check if token is expired
  if (auth.expiresAt && Date.now() > auth.expiresAt - 60000) {
    // Try to refresh
    const refreshed = await refreshToken(auth.refreshToken);
    if (refreshed) return refreshed;
    // If refresh fails, clear auth
    await signOut();
    return null;
  }

  return auth;
}

/**
 * Refresh the Firebase token
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
    if (data.error) return null;

    const authData = {
      ...(await chrome.storage.local.get(AUTH_STORAGE_KEY))[AUTH_STORAGE_KEY],
      token: data.id_token,
      refreshToken: data.refresh_token,
      expiresAt: Date.now() + parseInt(data.expires_in) * 1000,
    };

    await chrome.storage.local.set({ [AUTH_STORAGE_KEY]: authData });
    return authData;
  } catch {
    return null;
  }
}
