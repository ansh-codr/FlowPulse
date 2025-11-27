const baseSummary = {
  focus: 78,
  activeMinutes: 312,
  distractions: 22,
  topChannel: "Creative Systems",
};

let summary = { ...baseSummary };

async function pushSummary() {
  await chrome.storage.local.set({ summary });
}

function jitter() {
  summary = {
    focus: clamp(summary.focus + random(-3, 3), 55, 95),
    activeMinutes: summary.activeMinutes + random(1, 4),
    distractions: Math.max(0, summary.distractions + random(-1, 2)),
    topChannel: summary.focus > 80 ? "Deep Forge" : "Creative Systems",
  };
  pushSummary();
}

chrome.runtime.onInstalled.addListener(() => {
  summary = { ...baseSummary };
  pushSummary();
});

setInterval(jitter, 8000);

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === "FLOWPULSE_RESET") {
    summary = { ...baseSummary };
    pushSummary();
    sendResponse({ ok: true });
  }
});

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function random(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
