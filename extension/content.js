/**
 * FlowPulse — Content Script
 *
 * Runs on all pages. Detects:
 * 1. Dynamic title changes (SPAs)
 * 2. Window focus/blur events
 * 3. YouTube-specific metadata (video title, channel name)
 */

/* ── Title change observer ────────────────────────────────────────────────── */

let lastTitle = document.title;

/** Safe wrapper — silently no-ops if extension was reloaded/uninstalled */
function safeSend(msg) {
  try {
    if (!chrome.runtime?.id) return;
    chrome.runtime.sendMessage(msg).catch(() => {});
  } catch (_) { /* context invalidated */ }
}

const titleObserver = new MutationObserver(() => {
  const newTitle = document.title;
  if (newTitle !== lastTitle) {
    lastTitle = newTitle;
    safeSend({ type: "FLOWPULSE_TITLE_UPDATE", title: newTitle });
  }
});

const titleElement = document.querySelector("title");
if (titleElement) {
  titleObserver.observe(titleElement, { childList: true, characterData: true, subtree: true });
}

/* ── Window focus/blur ────────────────────────────────────────────────────── */

window.addEventListener("focus", () => safeSend({ type: "FLOWPULSE_WINDOW_FOCUS" }));
window.addEventListener("blur", () => safeSend({ type: "FLOWPULSE_WINDOW_BLUR" }));

/* ── YouTube metadata extraction ──────────────────────────────────────────── */

function isYouTube() {
  return (
    location.hostname === "www.youtube.com" ||
    location.hostname === "youtube.com" ||
    location.hostname === "m.youtube.com"
  );
}

function extractYouTubeMetadata() {
  if (!isYouTube()) return;

  // Only extract on watch pages
  if (!location.pathname.startsWith("/watch")) return;

  const videoTitle =
    document.querySelector("h1.ytd-video-primary-info-renderer yt-formatted-string")?.textContent ||
    document.querySelector("#title h1 yt-formatted-string")?.textContent ||
    document.querySelector("h1.title")?.textContent ||
    document.title.replace(" - YouTube", "").trim();

  const channelName =
    document.querySelector("#owner #channel-name a")?.textContent ||
    document.querySelector("ytd-channel-name yt-formatted-string a")?.textContent ||
    document.querySelector("#upload-info #channel-name a")?.textContent ||
    "";

  if (videoTitle || channelName) {
    safeSend({
      type: "FLOWPULSE_YOUTUBE_META",
      videoTitle: videoTitle?.trim() || "",
      channelName: channelName?.trim() || "",
    });
  }
}

// YouTube uses SPA navigation — watch for URL changes
if (isYouTube()) {
  // Initial extraction after page loads
  setTimeout(extractYouTubeMetadata, 2000);

  // Watch for SPA navigation
  let lastUrl = location.href;
  const urlObserver = new MutationObserver(() => {
    if (location.href !== lastUrl) {
      lastUrl = location.href;
      // Delay to let YouTube render new content
      setTimeout(extractYouTubeMetadata, 2000);
    }
  });

  urlObserver.observe(document.body, { childList: true, subtree: true });

  // Also observe the video player for metadata changes
  const metaObserver = new MutationObserver(() => {
    extractYouTubeMetadata();
  });

  // Wait for the info section to load
  const waitForInfo = setInterval(() => {
    const infoSection = document.querySelector("#info-contents") ||
                        document.querySelector("#above-the-fold");
    if (infoSection) {
      clearInterval(waitForInfo);
      metaObserver.observe(infoSection, { childList: true, subtree: true });
    }
  }, 1000);

  // Cleanup after 30 seconds if not found
  setTimeout(() => clearInterval(waitForInfo), 30000);
}

console.debug("[FlowPulse] Content script loaded on", location.hostname);
