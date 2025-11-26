/* eslint-disable @typescript-eslint/no-explicit-any */
declare const chrome: any;

const observer = new MutationObserver(() => {
  chrome.runtime.sendMessage({ type: "FLOWPULSE_TITLE_UPDATE", title: document.title });
});

observer.observe(document.querySelector("title") ?? document.documentElement, {
  subtree: true,
  characterData: true,
  childList: true,
});

window.addEventListener("focus", () => {
  chrome.runtime.sendMessage({ type: "FLOWPULSE_WINDOW_FOCUS" });
});

window.addEventListener("blur", () => {
  chrome.runtime.sendMessage({ type: "FLOWPULSE_WINDOW_BLUR" });
});
