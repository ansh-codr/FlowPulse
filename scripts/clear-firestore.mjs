#!/usr/bin/env node
/**
 * Wipe all seeded data for a user from Firestore.
 * Usage: node scripts/clear-firestore.mjs <UID>
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

const uid = process.argv[2];
if (!uid) { console.error("Usage: node scripts/clear-firestore.mjs <UID>"); process.exit(1); }

async function deleteCollection(ref) {
  const snap = await ref.get();
  if (snap.empty) return 0;
  const batch = db.batch();
  snap.docs.forEach(d => batch.delete(d.ref));
  await batch.commit();
  return snap.size;
}

async function main() {
  console.log(`\n🗑  Clearing all data for user: ${uid}\n`);

  const logs = await deleteCollection(db.collection("users").doc(uid).collection("activityLogs"));
  console.log(`  ✔ Deleted ${logs} activityLogs`);

  const stats = await deleteCollection(db.collection("users").doc(uid).collection("dailyStats"));
  console.log(`  ✔ Deleted ${stats} dailyStats`);

  const nudges = await deleteCollection(db.collection("users").doc(uid).collection("nudges"));
  console.log(`  ✔ Deleted ${nudges} nudges`);

  console.log(`\n✅ Firestore is clean. Only real-time extension data will appear now.\n`);
}

main().catch(e => { console.error(e); process.exit(1); });
