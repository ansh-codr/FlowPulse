import type {
  ActivityEvent,
  AppUsage,
  AttentionSlice,
  DashboardKpis,
  HeatmapCell,
  OverviewStats,
  SessionRecord,
  TimelineBlock,
} from "../../../shared/types";

const hours = Array.from({ length: 14 }, (_, i) => 9 + i);

const palette = [
  "#58f0ff",
  "#7b6bff",
  "#ff8ad6",
  "#6ef5b1",
  "#ffcb74",
  "#f97373",
];

const sampleApps = [
  "FlowPulse Dashboard",
  "Notion",
  "Figma",
  "Linear",
  "Slack",
  "Chrome DevTools",
  "YouTube",
  "Twitter",
];

function randomBetween(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function focusLevel(score: number) {
  if (score > 80) return "deep";
  if (score > 65) return "flow";
  if (score > 45) return "shallow";
  return "distracted";
}

export const overview: OverviewStats = {
  focusScore: 78,
  totalActiveMinutes: 9 * 60 + 12,
  distractionCount: 22,
  streakDays: 8,
  topCategory: "Creative Systems",
};

export const timeline: TimelineBlock[] = hours.map((hour, idx) => {
  const focusScore = 55 + Math.sin(idx / 2.2) * 25 + randomBetween(-6, 6);
  const dominantApp = sampleApps[(idx + randomBetween(0, sampleApps.length - 1)) % sampleApps.length];
  const activeMinutes = randomBetween(40, 58);
  return {
    hour: `${hour.toString().padStart(2, "0")}:00`,
    focusScore: Math.min(98, Math.max(35, Math.round(focusScore))),
    dominantApp,
    activeMinutes,
    focusLevel: focusLevel(focusScore),
  };
});

export const sessions: SessionRecord[] = timeline.slice(0, 12).map((block, idx) => {
  const startHour = 9 + idx * 1.25;
  const start = new Date(
    new Date().setHours(Math.floor(startHour), (startHour % 1) * 60)
  );
  const durationMinutes = randomBetween(35, 80);
  const end = new Date(start.getTime() + durationMinutes * 60000);
  return {
    id: `session-${idx}`,
    start: start.toISOString(),
    end: end.toISOString(),
    durationMinutes,
    focusLevel: block.focusLevel,
    notes: idx % 2 === 0 ? "Deep sprint on FlowPulse prototype" : undefined,
  };
});

export const attentionSplit: AttentionSlice[] = [
  { label: "Deep Forge", value: 42, color: "#58f0ff" },
  { label: "Creative Systems", value: 33, color: "#9c6bff" },
  { label: "Collab Orbit", value: 15, color: "#ff8a8a" },
  { label: "Recovery", value: 10, color: "#6ef5b1" },
];

export const distractionSources: AttentionSlice[] = [
  { label: "Notifications", value: 28, color: "#ffcb74" },
  { label: "Context Switching", value: 34, color: "#f97373" },
  { label: "Meetings", value: 18, color: "#58f0ff" },
  { label: "Social Tabs", value: 20, color: "#9c6bff" },
];

export const dashboardKpis: DashboardKpis = {
  contextSwitches: 14,
  longestSession: Math.max(...sessions.map((s) => s.durationMinutes)),
  deepestBlock: `${timeline[2].hour} → ${timeline[3].hour}`,
  shippedArtifacts: 5,
};

export const heatmap: HeatmapCell[] = Array.from({ length: 7 * 24 }, (_, idx) => {
  const day = Math.floor(idx / 24);
  const hour = idx % 24;
  const base = Math.max(0, Math.cos((hour - 14) / 4) + Math.sin((day - 3) / 2));
  const noise = (Math.random() - 0.5) * 0.4;
  const intensity = Math.max(0, Math.min(1, (base + noise) / 1.8));
  return {
    day,
    hour,
    intensity,
    label: `${["Mon","Tue","Wed","Thu","Fri","Sat","Sun"][day]} ${hour}:00`,
  };
});

export const apps: AppUsage[] = sampleApps.slice(0, 6).map((name, idx) => ({
  name,
  minutes: randomBetween(45, 160),
  color: palette[idx % palette.length],
  category: idx < 3 ? "Creation" : idx < 5 ? "Collab" : "Play",
}));

export const events: ActivityEvent[] = sessions.flatMap((session, sIdx) => {
  const logs: ActivityEvent[] = [];
  const entries = randomBetween(3, 6);
  for (let i = 0; i < entries; i += 1) {
    const start = new Date(new Date(session.start).getTime() + i * 10 * 60000);
    const end = new Date(start.getTime() + randomBetween(6, 18) * 60000);
    logs.push({
      id: `${session.id}-${i}`,
      title: `${sampleApps[(sIdx + i) % sampleApps.length]} session`,
      url: `https://${sampleApps[(sIdx + i) % sampleApps.length]
        .toLowerCase()
        .replace(/\s+/g, "")}.com`,
      start: start.toISOString(),
      end: end.toISOString(),
      focusScore: randomBetween(50, 95),
      category: i % 4 === 0 ? "social" : "work",
    });
  }
  return logs;
});

const baseUrl = import.meta.env.VITE_MOCK_API ?? "/mock-api";

async function fromEndpoint<T>(path: string, fallback: T): Promise<T> {
  try {
    const res = await fetch(`${baseUrl}${path}`);
    if (!res.ok) throw new Error("mock api offline");
    const payload = (await res.json()) as T;
    return payload;
  } catch {
    await delay();
    return fallback;
  }
}

export const mockApi = {
  getOverview: () => fromEndpoint("/overview", overview),
  getTimeline: () => fromEndpoint("/timeline", timeline),
  getHeatmap: () => fromEndpoint("/heatmap", heatmap),
  getSessions: () => fromEndpoint("/sessions", sessions),
  getApps: () => fromEndpoint("/top-apps", apps),
  getEvents: () => delay().then(() => events),
  getAttentionSplit: () => delay().then(() => attentionSplit),
  getDistractionSplit: () => delay().then(() => distractionSources),
  getKpis: () => delay().then(() => dashboardKpis),
};

function delay(ms = 220) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
