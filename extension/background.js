/**
 * FlowPulse — Background Service Worker (MV3)
 *
 * Tracks tab sessions, keeps local aggregate state, and periodically
 * upserts a lightweight daily Firestore summary document.
 */

import { classifyActivity, extractDomain } from "./lib/classifier.js";
import { getUserId, upsertDailyRealtimeSummary, getUserSettings } from "./lib/firebase.js";
import { getAuth, storeAuth } from "./lib/auth.js";

/* ── State ────────────────────────────────────────────────────────────────── */

let currentSession = null; // { url, domain, title, startTime, tabId }
let isIdle = false;
let trackingEnabled = true;
let blockedDomains = [];
let todaySummary = { focus: 0, activeMinutes: 0, distractions: 0, topChannel: "—" };
let dailyAggregate = null;

const IDLE_THRESHOLD_SEC = 60;
const AGG_STORAGE_KEY = "flowpulse_daily_aggregate";
const SUMMARY_STORAGE_KEY = "summary";
const MOBILE_STEPS_KEY = "flowpulse_mobile_steps_today";

function todayDateStr() {
  return new Date().toISOString().slice(0, 10);
}

function newDailyAggregate(date = todayDateStr()) {
  return {
    date,
    steps: 0,
    activeSeconds: 0,
    productiveSeconds: 0,
    distractionCount: 0,
    sessionCount: 0,
    domainDurations: {},
    dirty: false,
  };
}

function ensureTodayAggregate() {
  const today = todayDateStr();
  if (!dailyAggregate || dailyAggregate.date !== today) {
    dailyAggregate = newDailyAggregate(today);
  }
}

/* ── Initialization ───────────────────────────────────────────────────────── */

chrome.runtime.onInstalled.addListener(() => {
  console.log("[FlowPulse] Extension installed");
  chrome.idle.setDetectionInterval(IDLE_THRESHOLD_SEC);
  chrome.alarms.create("flowpulse-flush", { periodInMinutes: 0.5 });
  loadSettings();
  restoreState();
});

chrome.runtime.onStartup.addListener(() => {
  chrome.idle.setDetectionInterval(IDLE_THRESHOLD_SEC);
  chrome.alarms.create("flowpulse-flush", { periodInMinutes: 0.5 });
  loadSettings();
  restoreState();
});

// Also ensure alarm exists when service worker wakes up (belt and suspenders)
chrome.alarms.get("flowpulse-flush", (alarm) => {
  if (!alarm) {
    chrome.alarms.create("flowpulse-flush", { periodInMinutes: 0.5 });
    console.log("[FlowPulse] Re-created flush alarm");
  }
});
restoreState();

/* ── Settings sync ────────────────────────────────────────────────────────── */

async function loadSettings() {
  try {
    const uid = await getUserId();
    if (!uid) return;
    const settings = await getUserSettings(uid);
    if (settings) {
      trackingEnabled = settings.trackingEnabled;
      blockedDomains = settings.blockedDomains || [];
    }
  } catch (err) {
    console.warn("[FlowPulse] Settings load failed:", err);
  }
}

/* ── Local state persistence ──────────────────────────────────────────────── */

async function restoreState() {
  try {
    const result = await chrome.storage.local.get([AGG_STORAGE_KEY, SUMMARY_STORAGE_KEY, MOBILE_STEPS_KEY]);
    const savedAgg = result[AGG_STORAGE_KEY];
    if (savedAgg && typeof savedAgg === "object") {
      dailyAggregate = { ...newDailyAggregate(), ...savedAgg };
    }
    if (result[SUMMARY_STORAGE_KEY]) {
      todaySummary = result[SUMMARY_STORAGE_KEY];
    }
    if (typeof result[MOBILE_STEPS_KEY] === "number") {
      ensureTodayAggregate();
      dailyAggregate.steps = Math.max(0, Math.floor(result[MOBILE_STEPS_KEY]));
    }
    ensureTodayAggregate();
  } catch {
    ensureTodayAggregate();
  }
}

async function persistAggregate() {
  ensureTodayAggregate();
  await chrome.storage.local.set({ [AGG_STORAGE_KEY]: dailyAggregate });
}

/* ── Session management ───────────────────────────────────────────────────── */

function commitSession() {
  if (!currentSession || !trackingEnabled) return;

  const now = new Date().toISOString();
  const durationSec = Math.round(
    (Date.now() - new Date(currentSession.startTime).getTime()) / 1000
  );

  // Skip very short sessions (< 2 seconds)
  if (durationSec < 2) {
    currentSession = null;
    return;
  }

  const { category } = classifyActivity(
    currentSession.url,
    currentSession.title,
    currentSession.channelName || "",
    blockedDomains
  );

  const event = {
    url: currentSession.url,
    domain: currentSession.domain,
    title: currentSession.title || "",
    category,
    startTime: currentSession.startTime,
    endTime: now,
    duration: durationSec,
  };

  applySessionToAggregate(event);
  updateLocalSummaryFromAggregate();
  persistAggregate();

  currentSession = null;
}

function startSession(url, title, tabId) {
  if (!url || url.startsWith("chrome://") || url.startsWith("chrome-extension://")) {
    return;
  }

  currentSession = {
    url,
    domain: extractDomain(url),
    title: title || "",
    startTime: new Date().toISOString(),
    tabId,
    channelName: "",
  };
}

/* ── Local summary for popup ──────────────────────────────────────────────── */

function applySessionToAggregate(event) {
  ensureTodayAggregate();
  dailyAggregate.activeSeconds += event.duration;
  dailyAggregate.sessionCount += 1;
  if (event.category === "productive") {
    dailyAggregate.productiveSeconds += event.duration;
  }
  if (event.category === "distraction") {
    dailyAggregate.distractionCount += 1;
  }
  dailyAggregate.domainDurations[event.domain] =
    (dailyAggregate.domainDurations[event.domain] || 0) + event.duration;
  dailyAggregate.dirty = true;
}

function updateLocalSummaryFromAggregate() {
  ensureTodayAggregate();
  const activeMinutes = Math.round(dailyAggregate.activeSeconds / 60);
  const focus = dailyAggregate.activeSeconds > 0
    ? Math.round((dailyAggregate.productiveSeconds / dailyAggregate.activeSeconds) * 100)
    : 0;
  const sorted = Object.entries(dailyAggregate.domainDurations).sort((a, b) => b[1] - a[1]);

  todaySummary = {
    focus,
    activeMinutes,
    distractions: dailyAggregate.distractionCount,
    topChannel: sorted[0]?.[0] || "—",
  };
  chrome.storage.local.set({ [SUMMARY_STORAGE_KEY]: todaySummary });
}

/* ── Flush queue to Firestore ─────────────────────────────────────────────── */

async function flushQueue() {
  ensureTodayAggregate();
  if (!dailyAggregate.dirty) return;

  const uid = await getUserId();
  const authData = await getAuth();

  if (!uid || !authData) {
    console.log("[FlowPulse] Not signed in, keeping aggregate in local cache");
    return;
  }

  const payload = {
    date: dailyAggregate.date,
    steps: dailyAggregate.steps || 0,
    activitySummary: {
      activeMinutes: Math.round(dailyAggregate.activeSeconds / 60),
      productiveMinutes: Math.round(dailyAggregate.productiveSeconds / 60),
      distractionCount: dailyAggregate.distractionCount,
      focusScore: dailyAggregate.activeSeconds > 0
        ? Math.round((dailyAggregate.productiveSeconds / dailyAggregate.activeSeconds) * 100)
        : 0,
      topDomain: todaySummary.topChannel || "—",
      sessionCount: dailyAggregate.sessionCount,
    },
  };

  const success = await upsertDailyRealtimeSummary(uid, payload);

  if (!success) {
    await persistAggregate();
    console.warn("[FlowPulse] Flush failed, aggregate kept for retry");
  } else {
    dailyAggregate.dirty = false;
    await persistAggregate();
    console.log("[FlowPulse] Flushed lightweight daily summary to Firestore");
  }
}

/* ── Tab tracking ─────────────────────────────────────────────────────────── */

chrome.tabs.onActivated.addListener(async (activeInfo) => {
  if (!trackingEnabled) return;

  commitSession();

  try {
    const tab = await chrome.tabs.get(activeInfo.tabId);
    if (tab.url) {
      startSession(tab.url, tab.title, activeInfo.tabId);
    }
  } catch {}
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (!trackingEnabled) return;

  // Only care about URL changes on the active tab
  if (changeInfo.url && currentSession?.tabId === tabId) {
    commitSession();
    startSession(changeInfo.url, tab.title, tabId);
  }

  // Title updates
  if (changeInfo.title && currentSession?.tabId === tabId) {
    currentSession.title = changeInfo.title;
  }
});

chrome.windows.onFocusChanged.addListener((windowId) => {
  if (windowId === chrome.windows.WINDOW_ID_NONE) {
    commitSession();
  }
});

/* ── Idle detection ───────────────────────────────────────────────────────── */

chrome.idle.onStateChanged.addListener((state) => {
  if (state === "idle" || state === "locked") {
    isIdle = true;
    commitSession();
  } else if (state === "active") {
    isIdle = false;
    // Restart tracking on the current tab
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.url) {
        startSession(tabs[0].url, tabs[0].title, tabs[0].id);
      }
    });
  }
});

/* ── Alarm-based flush ────────────────────────────────────────────────────── */

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "flowpulse-flush") {
    flushQueue();
  }
});

/* ── Message handling ─────────────────────────────────────────────────────── */

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.type) {
    case "FLOWPULSE_YOUTUBE_META":
      // Content script sends YouTube video metadata
      if (currentSession && sender.tab?.id === currentSession.tabId) {
        currentSession.channelName = message.channelName || "";
        currentSession.title = message.videoTitle || currentSession.title;
      }
      sendResponse({ ok: true });
      break;

    case "FLOWPULSE_TITLE_UPDATE":
      if (currentSession && sender.tab?.id === currentSession.tabId) {
        currentSession.title = message.title;
      }
      sendResponse({ ok: true });
      break;

    case "FLOWPULSE_SYNC_NOW":
      commitSession();
      flushQueue().then(() => sendResponse({ ok: true }));
      return true; // Keep message channel open for async response

    case "FLOWPULSE_MOBILE_STEPS_UPDATE":
      ensureTodayAggregate();
      dailyAggregate.steps = Math.max(0, Math.floor(Number(message.steps || 0)));
      dailyAggregate.dirty = true;
      chrome.storage.local.set({ [MOBILE_STEPS_KEY]: dailyAggregate.steps });
      updateLocalSummaryFromAggregate();
      persistAggregate();
      sendResponse({ ok: true });
      break;

    case "FLOWPULSE_SETTINGS_CHANGED":
      loadSettings();
      sendResponse({ ok: true });
      break;

    case "FLOWPULSE_AUTH_CHANGED":
      loadSettings();
      flushQueue();
      sendResponse({ ok: true });
      break;

    case "FLOWPULSE_DASHBOARD_AUTH":
      // Auth received from dashboard content script
      storeAuth(message).then(() => {
        console.log("[FlowPulse] Auth received from dashboard, flushing queue...");
        loadSettings();
        flushQueue();
      });
      sendResponse({ ok: true });
      break;

    case "FLOWPULSE_DASHBOARD_NO_AUTH":
      // User not signed in on dashboard - ignore
      sendResponse({ ok: true });
      break;

    case "FLOWPULSE_RESET":
      // Reset today's local summary
      todaySummary = { focus: 0, activeMinutes: 0, distractions: 0, topChannel: "—" };
      dailyAggregate = newDailyAggregate();
      chrome.storage.local.remove([SUMMARY_STORAGE_KEY, AGG_STORAGE_KEY, MOBILE_STEPS_KEY]);
      currentSession = null;
      sendResponse({ ok: true });
      break;

    default:
      sendResponse({ ok: false, error: "Unknown message type" });
  }
});

console.log("[FlowPulse] Background service worker started");
