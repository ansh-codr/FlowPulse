/**
 * FlowPulse — Domain & YouTube Classifier
 *
 * Classifies URLs into: productive | neutral | distraction
 * YouTube videos get special treatment using title/channel keyword matching.
 */

import domainMap from "./domains.json";

const productiveSet = new Set(domainMap.productive);
const distractionSet = new Set(domainMap.distraction);
const neutralSet = new Set(domainMap.neutral);

const eduKeywords = domainMap.youtube_educational_keywords.map((k) =>
  k.toLowerCase()
);
const entertainKeywords = domainMap.youtube_entertainment_keywords.map((k) =>
  k.toLowerCase()
);

/**
 * Extract the root domain from a URL string.
 * e.g. "https://www.github.com/user/repo" → "github.com"
 */
export function extractDomain(urlStr) {
  try {
    const hostname = new URL(urlStr).hostname;
    // Remove leading "www."
    return hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

/**
 * Classify a domain into a category.
 * User-blocked domains always return "distraction".
 */
export function classifyDomain(domain, blockedDomains = []) {
  const d = domain.toLowerCase();

  // User-blocked domains override everything
  if (blockedDomains.includes(d)) return "distraction";

  // Check known maps
  if (productiveSet.has(d)) return "productive";
  if (distractionSet.has(d)) return "distraction";
  if (neutralSet.has(d)) return "neutral";

  // Check partial matches (subdomains)
  for (const known of productiveSet) {
    if (d.endsWith("." + known)) return "productive";
  }
  for (const known of distractionSet) {
    if (d.endsWith("." + known)) return "distraction";
  }

  // Default to neutral
  return "neutral";
}

/**
 * YouTube classification: computes a learning_probability (0-100)
 * based on keyword matching in title and channel name.
 *
 * Returns { category, learningProbability }
 */
export function classifyYouTube(title = "", channelName = "") {
  const text = `${title} ${channelName}`.toLowerCase();

  let eduScore = 0;
  let entertainScore = 0;

  // Keyword matching with weights
  for (const keyword of eduKeywords) {
    if (text.includes(keyword)) {
      eduScore += keyword.length > 8 ? 15 : 10; // Longer = more specific = higher weight
    }
  }
  for (const keyword of entertainKeywords) {
    if (text.includes(keyword)) {
      entertainScore += keyword.length > 8 ? 15 : 10;
    }
  }

  // Normalize to 0-100 scale
  const total = eduScore + entertainScore;
  const learningProbability =
    total > 0 ? Math.round((eduScore / total) * 100) : 50; // Unknown → 50

  // Threshold: ≥60% = productive
  const category = learningProbability >= 60 ? "productive" : "distraction";

  return { category, learningProbability };
}

/**
 * Main classifier: takes a URL + optional metadata and returns a category.
 */
export function classifyActivity(url, title = "", channelName = "", blockedDomains = []) {
  const domain = extractDomain(url);

  // YouTube special handling
  if (
    domain === "youtube.com" ||
    domain === "m.youtube.com" ||
    domain === "youtu.be"
  ) {
    return classifyYouTube(title, channelName);
  }

  return {
    category: classifyDomain(domain, blockedDomains),
    learningProbability: null,
  };
}

// ── Channel memory ──────────────────────────────────────────────────────────

const CHANNEL_MEMORY_KEY = "flowpulse_channel_memory";

export async function getChannelMemory() {
  try {
    const result = await chrome.storage.local.get(CHANNEL_MEMORY_KEY);
    return result[CHANNEL_MEMORY_KEY] || {};
  } catch {
    return {};
  }
}

export async function updateChannelMemory(channelName, category) {
  if (!channelName) return;
  const memory = await getChannelMemory();
  memory[channelName.toLowerCase()] = category;
  await chrome.storage.local.set({ [CHANNEL_MEMORY_KEY]: memory });
}
