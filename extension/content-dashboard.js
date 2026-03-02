/**
 * FlowPulse — Dashboard Auth Bridge (ISOLATED world)
 *
 * Receives auth data from the MAIN world content script
 * (which reads Firebase auth from the dashboard's IndexedDB)
 * and forwards it to the extension's background service worker.
 */

/** Safe wrapper — silently no-ops if extension was reloaded/uninstalled */
function safeSend(msg) {
  try {
    if (!chrome.runtime?.id) return;
    chrome.runtime.sendMessage(msg).catch(() => {});
  } catch (_) { /* context invalidated */ }
}

window.addEventListener("message", (event) => {
  if (event.source !== window) return;

  if (event.data?.type === "__FLOWPULSE_AUTH__" && event.data.uid) {
    safeSend({
      type: "FLOWPULSE_DASHBOARD_AUTH",
      uid: event.data.uid,
      email: event.data.email,
      displayName: event.data.displayName,
      photoURL: event.data.photoURL,
      refreshToken: event.data.refreshToken,
      accessToken: event.data.accessToken,
      expirationTime: event.data.expirationTime,
    });
  }

  if (event.data?.type === "__FLOWPULSE_NO_AUTH__") {
    safeSend({ type: "FLOWPULSE_DASHBOARD_NO_AUTH" });
  }
});

// Request auth from MAIN world script after a short delay
// (in case it loaded and posted before we were ready)
setTimeout(() => {
  window.postMessage({ type: "FLOWPULSE_REQUEST_AUTH" }, "*");
}, 500);
