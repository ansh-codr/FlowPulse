/**
 * FlowPulse Extension — Simplified Auth (Testing Mode)
 *
 * For development/testing: stores auth info locally.
 * The user signs in via the popup which saves their UID,
 * then the background script uses it for Firestore writes.
 *
 * In production, replace with chrome.identity OAuth2 flow.
 */

const AUTH_STORAGE_KEY = "flowpulse_auth";

/**
 * Sign in — stores a known UID for testing.
 * In production, replace with chrome.identity OAuth2 flow.
 */
export async function signIn() {
  const authData = {
    uid: "24GSYbfrI0UuEeNweA4nl70pxyq1",
    email: "dodgehellcatansh@gmail.com",
    displayName: "ansh yadav",
    photoURL: "",
    signedInAt: Date.now(),
  };

  await chrome.storage.local.set({ [AUTH_STORAGE_KEY]: authData });
  console.log("[FlowPulse] Signed in as:", authData.email);
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
 * Get current auth state
 */
export async function getAuth() {
  const result = await chrome.storage.local.get(AUTH_STORAGE_KEY);
  return result[AUTH_STORAGE_KEY] || null;
}
