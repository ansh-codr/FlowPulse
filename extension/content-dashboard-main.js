/**
 * FlowPulse — Dashboard Auth Reader (MAIN world)
 *
 * Runs in the page's JavaScript context on the dashboard domain.
 * Reads Firebase auth state from IndexedDB and broadcasts it
 * so the extension's ISOLATED world content script can pick it up.
 */

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
        let found = false;

        for (const item of items) {
          if (
            item.fbase_key &&
            item.fbase_key.startsWith("firebase:authUser:") &&
            item.value
          ) {
            const u = item.value;
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
            found = true;
            break;
          }
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
