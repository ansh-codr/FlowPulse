// @ts-nocheck
/* eslint-disable @typescript-eslint/no-explicit-any */
import { batcher } from "./lib/batcher";
import { getSession } from "./lib/auth";

let currentTabId: number | null = null;
let lastEventTs = Date.now();
let lastUrl = "";
let lastTitle = "";
let idle = false;

chrome.runtime.onInstalled.addListener(() => {
  chrome.alarms.create("flowpulse-flush", { periodInMinutes: 1 });
  chrome.idle.setDetectionInterval(60);
});

chrome.alarms.onAlarm.addListener(async (alarm: any) => {
  if (alarm.name !== "flowpulse-flush") return;
  const session = await getSession();
  await batcher.flush(session?.access_token ?? undefined);
});

chrome.tabs.onActivated.addListener(async (activeInfo: any) => {
  await commitEvent();
  currentTabId = activeInfo.tabId;
  await updateFromTabId(activeInfo.tabId);
});

chrome.tabs.onUpdated.addListener(async (
  tabId: number,
  changeInfo: any,
  tab: any
) => {
  if (tabId !== currentTabId) return;
  if (changeInfo.status === "complete" || changeInfo.url || changeInfo.title) {
    await updateFromTab(tab);
  }
});

chrome.idle.onStateChanged.addListener(async (newState: any) => {
  idle = newState !== "active";
  await commitEvent();
});

chrome.runtime.onMessage.addListener((
  message: Record<string, any>,
  _sender: any,
  sendResponse: (response: { ok: boolean; error?: string }) => void
) => {
  if (message.type === "FLOWPULSE_SYNC_NOW") {
    getSession()
      .then((session) => batcher.flush(session?.access_token ?? undefined))
      .then(() => sendResponse({ ok: true }))
      .catch((err) => sendResponse({ ok: false, error: err.message }));
    return true;
  }
  if (message.type === "FLOWPULSE_TITLE_UPDATE") {
    lastTitle = message.title ?? lastTitle;
    return false;
  }
  if (message.type === "FLOWPULSE_WINDOW_FOCUS") {
    idle = false;
    lastEventTs = Date.now();
    return false;
  }
  if (message.type === "FLOWPULSE_WINDOW_BLUR") {
    idle = true;
    return false;
  }
  return false;
});

async function commitEvent() {
  if (!lastUrl) return;
  const now = Date.now();
  const diffSeconds = Math.max(Math.round((now - lastEventTs) / 1000), 1);
  batcher.enqueue({
    ts: new Date(lastEventTs).toISOString(),
    url: lastUrl,
    title: lastTitle,
    active_seconds: diffSeconds,
    is_idle: idle,
  });
  lastEventTs = now;
}

async function updateFromTabId(tabId: number) {
  const tab = await chrome.tabs.get(tabId);
  await updateFromTab(tab);
}

async function updateFromTab(tab: any) {
  if (!tab?.url) return;
  await commitEvent();
  lastUrl = tab.url;
  lastTitle = tab.title ?? "";
  lastEventTs = Date.now();
}
