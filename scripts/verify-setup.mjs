import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(scriptDir, "..");

const checks = [];
let failed = false;

function addCheck(name, ok, details = "") {
  checks.push({ name, ok, details });
  if (!ok) failed = true;
}

function fileExists(relPath) {
  return fs.existsSync(path.join(root, relPath));
}

function readText(relPath) {
  return fs.readFileSync(path.join(root, relPath), "utf8");
}

function requireContains(relPath, expected, label) {
  const text = readText(relPath);
  addCheck(label, text.includes(expected), `${relPath} must include: ${expected}`);
}

function verifyDashboardEnvTemplate() {
  const relPath = "dashboard/.env.example";
  if (!fileExists(relPath)) {
    addCheck("Dashboard env template exists", false, `${relPath} missing`);
    return;
  }

  const required = [
    "VITE_FIREBASE_API_KEY=",
    "VITE_FIREBASE_AUTH_DOMAIN=",
    "VITE_FIREBASE_PROJECT_ID=",
    "VITE_FIREBASE_MESSAGING_SENDER_ID=",
    "VITE_FIREBASE_APP_ID=",
  ];

  const text = readText(relPath);
  const missing = required.filter((key) => !text.includes(key));
  addCheck(
    "Dashboard Firebase env keys present in template",
    missing.length === 0,
    missing.length ? `Missing: ${missing.join(", ")}` : "",
  );
}

function verifyRoutes() {
  const relPath = "dashboard/src/App.tsx";
  if (!fileExists(relPath)) {
    addCheck("Dashboard route file exists", false, `${relPath} missing`);
    return;
  }

  const requiredRoutes = [
    'path="/"',
    'path="/login"',
    'path="/extension"',
    'path="/app"',
    'path="timeline"',
    'path="heatmap"',
    'path="top-apps"',
    'path="sessions"',
    'path="leaderboard"',
    'path="insights"',
    'path="settings"',
  ];

  const text = readText(relPath);
  const missing = requiredRoutes.filter((entry) => !text.includes(entry));
  addCheck(
    "Dashboard routes configured",
    missing.length === 0,
    missing.length ? `Missing routes: ${missing.join(", ")}` : "",
  );
}

function verifyFirebaseBindings() {
  const relPath = "dashboard/src/lib/firebase.ts";
  const text = readText(relPath);

  const hasApiKey =
    text.includes("import.meta.env.VITE_FIREBASE_API_KEY") ||
    text.includes("apiKey:") && text.includes("AIza");
  addCheck(
    "Firebase API key binding",
    hasApiKey,
    `${relPath} must include public apiKey config (env-based or inline public key)`
  );

  const hasProjectId =
    text.includes("import.meta.env.VITE_FIREBASE_PROJECT_ID") ||
    text.includes('projectId: "flowpulse-698a3"') ||
    text.includes("projectId:");
  addCheck(
    "Firebase project ID binding",
    hasProjectId,
    `${relPath} must include projectId config (env-based or inline)`
  );

  requireContains(
    relPath,
    "initializeApp(firebaseConfig)",
    "Firebase app initialization",
  );
}

function verifyRepoFiles() {
  const requiredFiles = [
    "firebase.json",
    ".firebaserc",
    "firestore.rules",
    "firestore.indexes.json",
    "functions/package.json",
    "dashboard/package.json",
  ];

  const missing = requiredFiles.filter((relPath) => !fileExists(relPath));
  addCheck(
    "Core Firebase project files present",
    missing.length === 0,
    missing.length ? `Missing: ${missing.join(", ")}` : "",
  );
}

verifyRepoFiles();
verifyDashboardEnvTemplate();
verifyRoutes();
verifyFirebaseBindings();

console.log("\nFlowPulse Setup Verification\n");
for (const check of checks) {
  const icon = check.ok ? "[OK]" : "[FAIL]";
  console.log(`${icon} ${check.name}`);
  if (!check.ok && check.details) {
    console.log(`       ${check.details}`);
  }
}

if (failed) {
  console.log("\nVerification failed. Fix the items above and rerun.");
  process.exit(1);
}

console.log("\nVerification passed. Routes, Firebase env template, and core files are ready.");
