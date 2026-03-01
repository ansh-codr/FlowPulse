/**
 * seedData.ts – Populates Firestore with 7 days of realistic demo data.
 * Writes activityLogs, dailyStats, nudges for the signed-in user.
 */
import {
  collection,
  doc,
  writeBatch,
  Timestamp,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import type { ActivityCategory } from "../../../shared/types";

/* ── Domain pool ─────────────────────────────────────────────────────────── */
const PRODUCTIVE_DOMAINS = [
  { domain: "github.com", title: "GitHub" },
  { domain: "docs.google.com", title: "Google Docs" },
  { domain: "notion.so", title: "Notion" },
  { domain: "stackoverflow.com", title: "Stack Overflow" },
  { domain: "figma.com", title: "Figma" },
  { domain: "linear.app", title: "Linear" },
  { domain: "coursera.org", title: "Coursera" },
  { domain: "leetcode.com", title: "LeetCode" },
];

const DISTRACTION_DOMAINS = [
  { domain: "twitter.com", title: "Twitter / X" },
  { domain: "reddit.com", title: "Reddit" },
  { domain: "instagram.com", title: "Instagram" },
  { domain: "youtube.com", title: "YouTube" },
  { domain: "tiktok.com", title: "TikTok" },
];

const NEUTRAL_DOMAINS = [
  { domain: "gmail.com", title: "Gmail" },
  { domain: "calendar.google.com", title: "Google Calendar" },
  { domain: "slack.com", title: "Slack" },
  { domain: "zoom.us", title: "Zoom" },
];

/* ── Helpers ─────────────────────────────────────────────────────────────── */
function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function dateStr(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/* ── Generate activity logs for one day ──────────────────────────────────── */
function generateDayLogs(dayDate: Date) {
  const logs: Array<{
    url: string;
    domain: string;
    title: string;
    category: ActivityCategory;
    startTime: Date;
    endTime: Date;
    duration: number;
  }> = [];

  // Simulate 8-16 hours of activity (student schedule)
  const startHour = rand(8, 10);
  const endHour = rand(20, 23);
  let cursor = new Date(dayDate);
  cursor.setHours(startHour, rand(0, 30), 0, 0);

  const dayEnd = new Date(dayDate);
  dayEnd.setHours(endHour, 0, 0, 0);

  while (cursor < dayEnd) {
    // Weighted selection: 55% productive, 15% distraction, 30% neutral
    const roll = Math.random();
    let pool: typeof PRODUCTIVE_DOMAINS;
    let category: ActivityCategory;

    if (roll < 0.55) {
      pool = PRODUCTIVE_DOMAINS;
      category = "productive";
    } else if (roll < 0.70) {
      pool = DISTRACTION_DOMAINS;
      category = "distraction";
    } else {
      pool = NEUTRAL_DOMAINS;
      category = "neutral";
    }

    const site = pick(pool);
    const durationSec = category === "productive"
      ? rand(5 * 60, 45 * 60)   // 5-45 min productive sessions
      : category === "distraction"
        ? rand(2 * 60, 15 * 60)  // 2-15 min distractions
        : rand(3 * 60, 20 * 60); // 3-20 min neutral

    const start = new Date(cursor);
    const end = new Date(cursor.getTime() + durationSec * 1000);

    logs.push({
      url: `https://${site.domain}/session-${rand(1000, 9999)}`,
      domain: site.domain,
      title: `${site.title} — ${category === "productive" ? "Deep Work" : category === "distraction" ? "Browsing" : "Communication"}`,
      category,
      startTime: start,
      endTime: end,
      duration: durationSec,
    });

    // Gap between sessions (1-8 min)
    cursor = new Date(end.getTime() + rand(60, 480) * 1000);
  }

  return logs;
}

/* ── Aggregate logs → dailyStats ─────────────────────────────────────────── */
function aggregateLogs(logs: ReturnType<typeof generateDayLogs>, day: Date) {
  let productiveTime = 0, neutralTime = 0, distractionTime = 0, totalDuration = 0;
  const domainMap = new Map<string, { dur: number; cat: ActivityCategory }>();
  const hourBuckets = new Map<number, number>();
  let switches = 0;

  for (let i = 0; i < logs.length; i++) {
    const log = logs[i];
    totalDuration += log.duration;
    if (log.category === "productive") productiveTime += log.duration;
    else if (log.category === "distraction") distractionTime += log.duration;
    else neutralTime += log.duration;

    const existing = domainMap.get(log.domain);
    if (existing) existing.dur += log.duration;
    else domainMap.set(log.domain, { dur: log.duration, cat: log.category });

    const h = log.startTime.getHours();
    hourBuckets.set(h, (hourBuckets.get(h) ?? 0) + log.duration);

    if (i > 0 && logs[i].domain !== logs[i - 1].domain) switches++;
  }

  const peakHour = [...hourBuckets.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? 14;
  const focusScore = totalDuration > 0
    ? Math.round(Math.min(100, Math.max(0, (productiveTime / totalDuration) * 80 + (20 - (distractionTime / totalDuration) * 40))))
    : 0;

  const topDomains = [...domainMap.entries()]
    .sort((a, b) => b[1].dur - a[1].dur)
    .slice(0, 10)
    .map(([domain, { dur, cat }]) => ({ domain, duration: dur, category: cat }));

  const domainBreakdown: Record<string, number> = {};
  for (const [domain, { dur }] of domainMap) {
    domainBreakdown[domain] = dur;
  }

  return {
    date: dateStr(day),
    totalDuration,
    productiveTime,
    distractionTime,
    neutralTime,
    topDomains,
    peakHour,
    focusScore,
    contextSwitches: switches,
    domainBreakdown,
    updatedAt: new Date().toISOString(),
  };
}

/* ══════════════════════════════════════════════════════════════════════════
 * Main seed function — call from the dashboard
 * ══════════════════════════════════════════════════════════════════════════ */
export async function seedDemoData(uid: string): Promise<{ logsWritten: number; daysSeeded: number }> {
  let totalLogs = 0;
  const days = 7;

  for (let i = 0; i < days; i++) {
    const day = new Date();
    day.setDate(day.getDate() - i);
    day.setHours(0, 0, 0, 0);

    const logs = generateDayLogs(day);
    const stats = aggregateLogs(logs, day);

    // Firestore batches are limited to 500 operations
    // Split logs into chunks of 490 (leaving room for the stats doc)
    const chunks: typeof logs[] = [];
    for (let j = 0; j < logs.length; j += 490) {
      chunks.push(logs.slice(j, j + 490));
    }

    for (let c = 0; c < chunks.length; c++) {
      const batch = writeBatch(db);
      const chunk = chunks[c];

      for (const log of chunk) {
        const logRef = doc(collection(db, "users", uid, "activityLogs"));
        batch.set(logRef, {
          url: log.url,
          domain: log.domain,
          title: log.title,
          category: log.category,
          startTime: Timestamp.fromDate(log.startTime),
          endTime: Timestamp.fromDate(log.endTime),
          duration: log.duration,
        });
      }

      // Write dailyStats on the first chunk only
      if (c === 0) {
        const statsRef = doc(db, "users", uid, "dailyStats", dateStr(day));
        batch.set(statsRef, {
          ...stats,
          createdAt: serverTimestamp(),
        });
      }

      await batch.commit();
      totalLogs += chunk.length;
    }
  }

  // Write a sample nudge
  const nudgeBatch = writeBatch(db);
  const nudgeRef = doc(collection(db, "users", uid, "nudges"));
  nudgeBatch.set(nudgeRef, {
    type: "refocus",
    message: "Your distraction ratio was high this morning. Try a 25-min focused sprint!",
    timestamp: new Date().toISOString(),
    dismissed: false,
  });

  const nudgeRef2 = doc(collection(db, "users", uid, "nudges"));
  nudgeBatch.set(nudgeRef2, {
    type: "break",
    message: "You've been active for 4+ hours. Take a walk — your brain will thank you!",
    timestamp: new Date().toISOString(),
    dismissed: false,
  });
  await nudgeBatch.commit();

  return { logsWritten: totalLogs, daysSeeded: days };
}
