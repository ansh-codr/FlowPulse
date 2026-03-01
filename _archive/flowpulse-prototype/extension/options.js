const themeToggle = document.getElementById("themeToggle");
const distractionToggle = document.getElementById("distractionToggle");
const resetBtn = document.getElementById("resetBtn");

chrome.storage.sync.get(["theme", "mode"], ({ theme = "glass", mode = "balanced" }) => {
  themeToggle.checked = theme === "cyber";
  distractionToggle.checked = mode === "chaos";
});

themeToggle.addEventListener("change", () => {
  chrome.storage.sync.set({ theme: themeToggle.checked ? "cyber" : "glass" });
});

distractionToggle.addEventListener("change", () => {
  chrome.storage.sync.set({ mode: distractionToggle.checked ? "chaos" : "balanced" });
});

resetBtn.addEventListener("click", () => {
  chrome.storage.local.remove("summary");
  chrome.runtime.sendMessage({ type: "FLOWPULSE_RESET" });
});
