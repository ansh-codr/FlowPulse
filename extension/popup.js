import { signIn, signOut, getAuth, isSignedIn } from "./lib/auth.js";

const RADIUS = 65;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const $  = (id) => document.getElementById(id);
const authSection = $("authSection");
const mainSection = $("mainSection");

/* ── Focus Ring SVG ─────────────────────────────────── */
function drawRing(percent) {
  const svg = document.querySelector("svg");
  if (!svg) return;
  const offset = CIRCUMFERENCE - (percent / 100) * CIRCUMFERENCE;
  svg.innerHTML = `
    <circle cx="80" cy="80" r="${RADIUS}" stroke="rgba(255,255,255,0.08)" stroke-width="10" fill="transparent"/>
    <circle cx="80" cy="80" r="${RADIUS}"
      stroke="url(#grad)" stroke-width="10" stroke-linecap="round"
      fill="transparent"
      stroke-dasharray="${CIRCUMFERENCE}"
      stroke-dashoffset="${offset}"
      style="transition: stroke-dashoffset 0.6s ease"/>
    <defs>
      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#58f0ff"/>
        <stop offset="100%" stop-color="#9c6bff"/>
      </linearGradient>
    </defs>`;
}

/* ── Hydrate stats from storage ─────────────────────── */
async function hydrate() {
  const { summary } = await chrome.storage.local.get("summary");
  const data = summary ?? { focus: 0, activeMinutes: 0, distractions: 0, topDomain: "—" };
  $("focusValue").textContent   = `${data.focus}%`;
  $("activeMinutes").textContent = `${data.activeMinutes}m`;
  $("distractions").textContent  = `${data.distractions}`;
  $("topChannel").textContent    = data.topDomain || "—";
  drawRing(data.focus);
}

/* ── Auth state toggle ──────────────────────────────── */
async function checkAuth() {
  const auth = await getAuth();
  if (auth) {
    authSection.style.display = "none";
    mainSection.style.display = "flex";
    const avatar = $("userAvatar");
    if (auth.photoUrl) { avatar.src = auth.photoUrl; avatar.style.display = "block"; }
    else { avatar.style.display = "none"; }
    hydrate();
  } else {
    authSection.style.display = "flex";
    mainSection.style.display = "none";
  }
}

/* ── Button handlers ────────────────────────────────── */
$("signInBtn").addEventListener("click", () => {
  signIn(); // Opens dashboard in a new tab
  window.close(); // Close popup — auth will be picked up automatically
});

$("signOutBtn").addEventListener("click", async () => {
  await signOut();
  chrome.runtime.sendMessage({ type: "FLOWPULSE_AUTH_CHANGED" });
  checkAuth();
});

$("syncBtn").addEventListener("click", () => {
  $("syncBtn").textContent = "Syncing…";
  chrome.runtime.sendMessage({ type: "FLOWPULSE_SYNC_NOW" }, () => {
    setTimeout(() => { $("syncBtn").textContent = "Sync Now"; }, 1200);
  });
});

$("openDashboard").addEventListener("click", () => {
  chrome.tabs.create({ url: "https://fllowpulse.netlify.app/" });
});

/* ── Live updates ───────────────────────────────────── */
chrome.storage.onChanged.addListener((changes) => {
  if (changes.summary) hydrate();
  if (changes.flowpulse_auth) checkAuth(); // Auto-update when auth arrives from dashboard
});

/* ── Init ───────────────────────────────────────────── */
checkAuth();
