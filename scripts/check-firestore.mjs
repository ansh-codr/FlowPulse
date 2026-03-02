#!/usr/bin/env node
/**
 * Check what data (if any) exists in Firestore for a user.
 */
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const sa = JSON.parse(readFileSync(resolve(__dirname, "..", "service-account.json"), "utf-8"));
initializeApp({ credential: cert(sa) });
const db = getFirestore();

const uid = process.argv[2] || "24GSYbfrI0UuEeNweA4nl70pxyq1";

async function main() {
  console.log(`\n📊 Checking Firestore data for user: ${uid}\n`);

  // Check activityLogs
  const logsSnap = await db.collection("users").doc(uid).collection("activityLogs").orderBy("startTime", "desc").limit(10).get();
  console.log(`activityLogs: ${logsSnap.size} documents (showing up to 10 most recent)\n`);
  logsSnap.docs.forEach((d, i) => {
    const data = d.data();
    console.log(`  [${i+1}] id=${d.id}`);
    console.log(`      domain: ${data.domain}`);
    console.log(`      category: ${data.category}`);
    console.log(`      duration: ${data.duration}s`);
    console.log(`      startTime type: ${typeof data.startTime}, value: ${data.startTime?.toDate ? data.startTime.toDate().toISOString() : data.startTime}`);
    console.log(`      endTime type: ${typeof data.endTime}, value: ${data.endTime?.toDate ? data.endTime.toDate().toISOString() : data.endTime}`);
    console.log();
  });

  // Check dailyStats
  const statsSnap = await db.collection("users").doc(uid).collection("dailyStats").get();
  console.log(`dailyStats: ${statsSnap.size} documents`);
  statsSnap.docs.forEach(d => {
    console.log(`  ${d.id}: ${JSON.stringify(d.data()).slice(0, 120)}...`);
  });

  // Check nudges
  const nudgesSnap = await db.collection("users").doc(uid).collection("nudges").get();
  console.log(`\nnudges: ${nudgesSnap.size} documents`);
}

main().catch(e => { console.error(e); process.exit(1); });
