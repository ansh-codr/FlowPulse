#!/usr/bin/env node
/**
 * seed-firestore.mjs — Populate Firestore with 7 days of realistic demo data.
 *
 * Usage:
 *   node scripts/seed-firestore.mjs <USER_UID>
 *
 * The UID is your Firebase Auth user ID. You can find it in:
 *   - Firebase Console → Authentication → Users
 *   - Or the browser console after signing in (user.uid)
 */

import { initializeApp, cert, applicationDefault } from "firebase-admin/app";
import { getFirestore, Timestamp, FieldValue } from "firebase-admin/firestore";
import { readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

/* ─── Firebase Admin init ───────────────────────────────────────────────── */
const serviceAccountPath = resolve(ROOT, "service-account.json");

if (existsSync(serviceAccountPath)) {
  const sa = JSON.parse(readFileSync(serviceAccountPath, "utf-8"));
  initializeApp({ credential: cert(sa) });
  console.log("✔ Authenticated via service-account.json");
} else {
  // Fallback: use Application Default Credentials (gcloud auth / CI)
  try {
    initializeApp({ credential: applicationDefault(), projectId: "flowpulse-dc45a" });
    console.log("✔ Authenticated via Application Default Credentials");
  } catch {
    console.error(
      "✖ No service-account.json found and Application Default Credentials failed.\n" +
      "  → Download your service account key from:\n" +
      "    Firebase Console → Project Settings → Service Accounts → Generate New Private Key\n" +
      "  → Save it as: service-account.json (in the project root)"
    );
    process.exit(1);
  }
}

const db = getFirestore();

/* ─── CLI arg ───────────────────────────────────────────────────────────── */
const uid = process.argv[2];
if (!uid) {
  console.error("Usage: node scripts/seed-firestore.mjs <USER_UID>");
  console.error("  Find your UID in Firebase Console → Authentication → Users");
  process.exit(1);
}
console.log(`\n🎯 Seeding data for user: ${uid}\n`);

/* ─── Domain pools ──────────────────────────────────────────────────────── */
const PRODUCTIVE = [
  { domain: "github.com", title: "GitHub" },
  { domain: "docs.google.com", title: "Google Docs" },
  { domain: "notion.so", title: "Notion" },
  { domain: "stackoverflow.com", title: "Stack Overflow" },
  { domain: "figma.com", title: "Figma" },
  { domain: "linear.app", title: "Linear" },
  { domain: "coursera.org", title: "Coursera" },
  { domain: "leetcode.com", title: "LeetCode" },
];

const DISTRACTION = [
  { domain: "twitter.com", title: "Twitter / X" },
  { domain: "reddit.com", title: "Reddit" },
  { domain: "instagram.com", title: "Instagram" },
  { domain: "youtube.com", title: "YouTube" },
  { domain: "tiktok.com", title: "TikTok" },
];

const NEUTRAL = [
  { domain: "gmail.com", title: "Gmail" },
  { domain: "calendar.google.com", title: "Google Calendar" },
  { domain: "slack.com", title: "Slack" },
  { domain: "zoom.us", title: "Zoom" },
];

/* ─── Helpers ───────────────────────────────────────────────────────────── */
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const fmtDate = (d) => d.toISOString().slice(0, 10);

/* ─── Generate logs for one day ─────────────────────────────────────────── */
function generateDayLogs(dayDate) {
  const logs = [];
  const startHour = rand(8, 10);
  const endHour = rand(20, 23);

  let cursor = new Date(dayDate);
  cursor.setHours(startHour, rand(0, 30), 0, 0);

  const dayEnd = new Date(dayDate);
  dayEnd.setHours(endHour, 0, 0, 0);

  while (cursor < dayEnd) {
    const roll = Math.random();
    let pool, category;

    if (roll < 0.55) {
      pool = PRODUCTIVE;
      category = "productive";
    } else if (roll < 0.70) {
      pool = DISTRACTION;
      category = "distraction";
    } else {
      pool = NEUTRAL;
      category = "neutral";
    }

    const site = pick(pool);
    const durationSec =
      category === "productive" ? rand(5 * 60, 45 * 60) :
      category === "distraction" ? rand(2 * 60, 15 * 60) :
      rand(3 * 60, 20 * 60);

    const start = new Date(cursor);
    const end = new Date(cursor.getTime() + durationSec * 1000);

    logs.push({
      url: `https://${site.domain}/session-${rand(1000, 9999)}`,
      domain: site.domain,
      title: `${site.title} — ${category === "productive" ? "Deep Work" : category === "distraction" ? "Browsing" : "Comms"}`,
      category,
      startTime: Timestamp.fromDate(start),
      endTime: Timestamp.fromDate(end),
      duration: durationSec,
    });

    cursor = new Date(end.getTime() + rand(60, 480) * 1000);
  }
  return logs;
}

/* ─── Aggregate logs → dailyStats ───────────────────────────────────────── */
function aggregateLogs(logs, day) {
  let productiveTime = 0, neutralTime = 0, distractionTime = 0, totalDuration = 0;
  const domainMap = new Map();
  const hourBuckets = new Map();
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

    const h = log.startTime.toDate().getHours();
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

  const domainBreakdown = {};
  for (const [domain, { dur }] of domainMap) domainBreakdown[domain] = dur;

  return {
    date: fmtDate(day),
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

/* ═══════════════════════════════════════════════════════════════════════════
 * SEED
 * ═══════════════════════════════════════════════════════════════════════════ */
async function seed() {
  const DAYS = 7;
  let totalLogs = 0;

  for (let i = 0; i < DAYS; i++) {
    const day = new Date();
    day.setDate(day.getDate() - i);
    day.setHours(0, 0, 0, 0);

    const logs = generateDayLogs(day);
    const stats = aggregateLogs(logs, day);

    // Firestore batch limit = 500 ops
    const chunks = [];
    for (let j = 0; j < logs.length; j += 490) chunks.push(logs.slice(j, j + 490));

    for (let c = 0; c < chunks.length; c++) {
      const batch = db.batch();
      for (const log of chunks[c]) {
        const ref = db.collection("users").doc(uid).collection("activityLogs").doc();
        batch.set(ref, log);
      }
      if (c === 0) {
        const statsRef = db.collection("users").doc(uid).collection("dailyStats").doc(fmtDate(day));
        batch.set(statsRef, { ...stats, createdAt: FieldValue.serverTimestamp() });
      }
      await batch.commit();
      totalLogs += chunks[c].length;
    }

    const label = i === 0 ? "today" : i === 1 ? "yesterday" : `${i} days ago`;
    console.log(`  📅 ${fmtDate(day)} (${label}) — ${logs.length} logs, focus ${stats.focusScore}%`);
  }

  // Nudges
  const nudgeBatch = db.batch();
  const nudge1 = db.collection("users").doc(uid).collection("nudges").doc();
  nudgeBatch.set(nudge1, {
    type: "refocus",
    message: "Your distraction ratio was high this morning. Try a 25-min focused sprint!",
    timestamp: new Date().toISOString(),
    dismissed: false,
  });
  const nudge2 = db.collection("users").doc(uid).collection("nudges").doc();
  nudgeBatch.set(nudge2, {
    type: "break",
    message: "You've been active for 4+ hours. Take a walk — your brain will thank you!",
    timestamp: new Date().toISOString(),
    dismissed: false,
  });
  await nudgeBatch.commit();

  console.log(`\n✅ Done! Seeded ${totalLogs} activity logs over ${DAYS} days + 2 nudges.\n`);
  console.log("Open the dashboard and sign in — the real-time subscriptions will pick up the data instantly.");
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
