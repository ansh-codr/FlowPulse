const fallback = {
  focus: 78,
  activeMinutes: 312,
  distractions: 22,
  topChannel: "Creative Systems",
};

const svg = document.querySelector("svg");
const radius = 65;
const circumference = 2 * Math.PI * radius;

function drawRing(percent) {
  svg.innerHTML = `
    <circle cx="80" cy="80" r="${radius}" stroke="rgba(255,255,255,0.08)" stroke-width="10" fill="transparent" />
    <circle
      cx="80"
      cy="80"
      r="${radius}"
      stroke="url(#gradient)"
      stroke-width="10"
      stroke-linecap="round"
      fill="transparent"
      stroke-dasharray="${circumference}"
      stroke-dashoffset="${circumference - (percent / 100) * circumference}"
    />
    <defs>
      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#58f0ff" />
        <stop offset="100%" stop-color="#9c6bff" />
      </linearGradient>
    </defs>
  `;
}

async function hydrate() {
  const { summary } = await chrome.storage.local.get("summary");
  const data = summary ?? fallback;
  document.getElementById("focusValue").textContent = `${data.focus}%`;
  document.getElementById("activeMinutes").textContent = `${data.activeMinutes}m`;
  document.getElementById("distractions").textContent = `${data.distractions}`;
  document.getElementById("topChannel").textContent = data.topChannel;
  drawRing(data.focus);
}

hydrate();

chrome.storage.onChanged.addListener((changes) => {
  if (changes.summary) {
    hydrate();
  }
});

document.getElementById("openDashboard").addEventListener("click", () => {
  chrome.tabs.create({ url: "http://localhost:5173/" });
});
