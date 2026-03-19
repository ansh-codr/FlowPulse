/**
 * useExtensionDetect — Detects whether the FlowPulse Chrome extension is installed.
 *
 * How it works:
 * The extension injects content-dashboard-main.js on the dashboard domain (MAIN world).
 * That script sets `window.__FLOWPULSE_EXTENSION__ = true` and posts auth messages.
 * This hook checks for that flag after a short delay (giving the content script time to load).
 *
 * Returns:
 *   detected: true | false | null (null = still checking)
 */
import { useEffect, useState } from "react";

declare global {
  interface Window {
    __FLOWPULSE_EXTENSION__?: boolean;
  }
}

const CHECK_WINDOW_MS = 10000;
const CHECK_INTERVAL_MS = 1000;

export function useExtensionDetect(): { detected: boolean | null } {
  const [detected, setDetected] = useState<boolean | null>(null);

  useEffect(() => {
    // Immediate check — extension may already have injected the flag
    if (window.__FLOWPULSE_EXTENSION__) {
      setDetected(true);
      return;
    }

    // Listen for the extension's heartbeat message
    function onMessage(event: MessageEvent) {
      if (
        event.source === window &&
        (event.data?.type === "__FLOWPULSE_AUTH__" ||
         event.data?.type === "__FLOWPULSE_NO_AUTH__" ||
         event.data?.type === "__FLOWPULSE_EXTENSION_PRESENT__")
      ) {
        setDetected(true);
      }
    }

    window.addEventListener("message", onMessage);

    // Request auth — if extension is present, it will respond
    window.postMessage({ type: "FLOWPULSE_REQUEST_AUTH" }, "*");

    let elapsed = 0;
    const interval = setInterval(() => {
      if (window.__FLOWPULSE_EXTENSION__) {
        setDetected(true);
        return;
      }

      elapsed += CHECK_INTERVAL_MS;
      if (elapsed >= CHECK_WINDOW_MS) {
        setDetected((prev) => (prev === null ? false : prev));
        clearInterval(interval);
        return;
      }

      // Re-ping in case the extension main-world bridge injected after app boot.
      window.postMessage({ type: "FLOWPULSE_REQUEST_AUTH" }, "*");
    }, CHECK_INTERVAL_MS);

    return () => {
      window.removeEventListener("message", onMessage);
      clearInterval(interval);
    };
  }, []);

  return { detected };
}
