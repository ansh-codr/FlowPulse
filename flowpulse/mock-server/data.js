const overview = {
  focusScore: 78,
  totalActiveMinutes: 552,
  distractionCount: 22,
  streakDays: 8,
  topCategory: "Creative Systems",
};

const timeline = Array.from({ length: 12 }, (_, idx) => {
  const hour = 9 + idx;
  return {
    hour: `${hour.toString().padStart(2, "0")}:00`,
    focusScore: Math.round(70 + Math.sin(idx / 1.7) * 20 + (Math.random() - 0.5) * 8),
    activeMinutes: Math.round(40 + Math.random() * 20),
    dominantApp: ["Notion", "Figma", "Linear", "Slack", "Chrome"][idx % 5],
    focusLevel: ["flow", "deep", "flow", "shallow"][idx % 4],
  };
});

const heatmap = Array.from({ length: 7 * 24 }, (_, idx) => {
  const day = Math.floor(idx / 24);
  const hour = idx % 24;
  return {
    day,
    hour,
    intensity: Math.max(0, Math.min(1, Math.cos((hour - 14) / 4) + Math.sin(day / 2) + (Math.random() - 0.5))) / 2,
    label: `Day ${day} Hour ${hour}`,
  };
});

const sessions = timeline.slice(0, 6).map((block, idx) => ({
  id: `session-${idx}`,
  start: `2025-06-01T${block.hour}:00:00.000Z`,
  end: `2025-06-01T${block.hour.slice(0, 2)}:55:00.000Z`,
  durationMinutes: 55,
  focusLevel: block.focusLevel,
  notes: idx % 2 === 0 ? "Wireframing + architecture review" : "Deep dev sprint",
}));

const topApps = [
  { name: "FlowPulse", minutes: 160, color: "#58f0ff", category: "Build" },
  { name: "Notion", minutes: 120, color: "#9c6bff", category: "Docs" },
  { name: "Slack", minutes: 68, color: "#ff8a8a", category: "Sync" },
  { name: "YouTube", minutes: 45, color: "#f97373", category: "Inspo" },
  { name: "Twitter", minutes: 32, color: "#6ef5b1", category: "Social" },
];

export const dataset = { overview, timeline, heatmap, sessions, topApps };
