/**
 * FlowPulse — Background Service Worker (MV3)
 *
 * Real tab tracking with idle detection, domain classification,
 * batched writes to Firestore, and YouTube metadata handling.
 */

import { classifyActivity, extractDomain } from "./lib/classifier.js";
import { getUserId, writeActivityLogs, getUserSettings } from "./lib/firebase.js";
import { getAuth } from "./lib/auth.js";

/* ── State ────────────────────────────────────────────────────────────────── */

let currentSession = null; // { url, domain, title, startTime, tabId }
let eventQueue = [];       // Batched events pending Firestore write
let isIdle = false;
let trackingEnabled = true;
let blockedDomains = [];
let todaySummary = { focus: 0, activeMinutes: 0, distractions: 0, topChannel: "—" };

const FLUSH_INTERVAL_MS = 30_000; // 30 seconds
const MAX_QUEUE_SIZE = 20;
const IDLE_THRESHOLD_SEC = 60;
const QUEUE_STORAGE_KEY = "flowpulse_event_queue";
const SUMMARY_STORAGE_KEY = "summary";

/* ── Initialization ───────────────────────────────────────────────────────── */

chrome.runtime.onInstalled.addListener(() => {
  console.log("[FlowPulse] Extension installed");
  chrome.idle.setDetectionInterval(IDLE_THRESHOLD_SEC);
  chrome.alarms.create("flowpulse-flush", { periodInMinutes: 0.5 });
  loadSettings();
  restoreQueue();
});

chrome.runtime.onStartup.addListener(() => {
  chrome.idle.setDetectionInterval(IDLE_THRESHOLD_SEC);
  chrome.alarms.create("flowpulse-flush", { periodInMinutes: 0.5 });
  loadSettings();
  restoreQueue();
});

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

/* ── Queue persistence ────────────────────────────────────────────────────── */

async function restoreQueue() {
  try {
    const result = await chrome.storage.local.get(QUEUE_STORAGE_KEY);
    if (result[QUEUE_STORAGE_KEY]?.length) {
      eventQueue = result[QUEUE_STORAGE_KEY];
    }
  } catch {}
}

async function persistQueue() {
  await chrome.storage.local.set({ [QUEUE_STORAGE_KEY]: eventQueue });
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
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    url: currentSession.url,
    domain: currentSession.domain,
    title: currentSession.title || "",
    category,
    startTime: currentSession.startTime,
    endTime: now,
    duration: durationSec,
  };

  eventQueue.push(event);
  updateLocalSummary(event);
  persistQueue();

  // Auto-flush if queue is large
  if (eventQueue.length >= MAX_QUEUE_SIZE) {
    flushQueue();
  }

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

function updateLocalSummary(event) {
  const minutes = Math.round(event.duration / 60);

  if (event.category === "distraction") {
    todaySummary.distractions++;
  }
  todaySummary.activeMinutes += minutes;

  // Simple focus approximation: productive ratio
  const totalEvents = eventQueue.length;
  const productiveEvents = eventQueue.filter((e) => e.category === "productive").length;
  todaySummary.focus = totalEvents > 0
    ? Math.round((productiveEvents / totalEvents) * 100)
    : 50;

  // Top domain
  const domainCounts = {};
  for (const e of eventQueue) {
    domainCounts[e.domain] = (domainCounts[e.domain] || 0) + e.duration;
  }
  const sorted = Object.entries(domainCounts).sort((a, b) => b[1] - a[1]);
  todaySummary.topChannel = sorted[0]?.[0] || "—";

  chrome.storage.local.set({ [SUMMARY_STORAGE_KEY]: todaySummary });
}

/* ── Flush queue to Firestore ─────────────────────────────────────────────── */

async function flushQueue() {
  if (eventQueue.length === 0) return;

  const uid = await getUserId();
  const authData = await getAuth();

  if (!uid || !authData) {
    console.log("[FlowPulse] Not signed in, keeping events in local queue");
    return;
  }

  const batch = [...eventQueue];
  eventQueue = [];
  await persistQueue();

  const success = await writeActivityLogs(uid, batch);

  if (!success) {
    // Re-queue failed events
    eventQueue = [...batch, ...eventQueue];
    await persistQueue();
    console.warn("[FlowPulse] Flush failed, re-queued", batch.length, "events");
  } else {
    console.log("[FlowPulse] Flushed", batch.length, "events to Firestore");
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

    case "FLOWPULSE_SETTINGS_CHANGED":
      loadSettings();
      sendResponse({ ok: true });
      break;

    case "FLOWPULSE_AUTH_CHANGED":
      loadSettings();
      flushQueue();
      sendResponse({ ok: true });
      break;

    default:
      sendResponse({ ok: false, error: "Unknown message type" });
  }
});

console.log("[FlowPulse] Background service worker started");
