/**
 * FlowPulse — Dashboard Auth Reader (MAIN world)
 *
 * Runs in the page's JavaScript context on the dashboard domain.
 * Reads Firebase auth state from IndexedDB and broadcasts it
 * so the extension's ISOLATED world content script can pick it up.
 */

// Signal presence so the dashboard can detect the extension is installed
window.__FLOWPULSE_EXTENSION__ = true;
window.postMessage({ type: "__FLOWPULSE_EXTENSION_PRESENT__" }, "*");

const EXPECTED_FIREBASE_API_KEY = "AIzaSyDtG3UyShHnsMq99TsUOrKb0LWWIBQ7V4M";

function normalizeAuthUser(rawValue) {
  if (!rawValue) return null;
  if (typeof rawValue === "object") return rawValue;
  if (typeof rawValue === "string") {
    try {
      return JSON.parse(rawValue);
    } catch {
      return null;
    }
  }
  return null;
}

function readFirebaseAuth() {
  try {
    const request = indexedDB.open("firebaseLocalStorageDb");

    request.onsuccess = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains("firebaseLocalStorage")) {
        db.close();
        return;
      }

      const tx = db.transaction("firebaseLocalStorage", "readonly");
      const store = tx.objectStore("firebaseLocalStorage");
      const getReq = store.getAll();

      getReq.onsuccess = () => {
        const items = getReq.result || [];
        const authItems = items.filter((item) =>
          item?.fbase_key &&
          item.fbase_key.startsWith("firebase:authUser:") &&
          normalizeAuthUser(item.value)
        );

        const preferred = authItems.find((item) =>
          String(item.fbase_key).includes(EXPECTED_FIREBASE_API_KEY) &&
          !!normalizeAuthUser(item.value)?.stsTokenManager?.refreshToken
        );

        const fallback = authItems.find((item) => !!normalizeAuthUser(item.value)?.stsTokenManager?.refreshToken);
        const selected = preferred || fallback;
        const found = !!selected;

        if (selected) {
          const u = normalizeAuthUser(selected.value);
          if (!u) {
            window.postMessage({ type: "__FLOWPULSE_NO_AUTH__" }, "*");
            db.close();
            return;
          }
          window.postMessage(
            {
              type: "__FLOWPULSE_AUTH__",
              uid: u.uid,
              email: u.email || "",
              displayName: u.displayName || "",
              photoURL: u.photoURL || "",
              refreshToken: u.stsTokenManager
                ? u.stsTokenManager.refreshToken
                : "",
              accessToken: u.stsTokenManager
                ? u.stsTokenManager.accessToken
                : "",
              expirationTime: u.stsTokenManager
                ? u.stsTokenManager.expirationTime
                : 0,
            },
            "*"
          );
        }

        if (!found) {
          window.postMessage({ type: "__FLOWPULSE_NO_AUTH__" }, "*");
        }

        db.close();
      };
    };

    request.onerror = () => {};
  } catch (e) {
    // Silently fail
  }
}

// Read immediately
readFirebaseAuth();

// Retry after delays (Firebase auth may not be loaded yet)
setTimeout(readFirebaseAuth, 2000);
setTimeout(readFirebaseAuth, 5000);
setTimeout(readFirebaseAuth, 10000);

// Listen for explicit auth requests from the extension
window.addEventListener("message", (event) => {
  if (event.data?.type === "FLOWPULSE_REQUEST_AUTH") {
    readFirebaseAuth();
  }
});
