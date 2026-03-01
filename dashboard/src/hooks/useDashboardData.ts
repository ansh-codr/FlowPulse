/**
 * useDashboardData – Transforms Firestore data into dashboard view models.
 * Central hook that all pages consume for real Firebase data.
 */
import { useEffect, useState, useMemo } from "react";
import { useAuth } from "./useAuth";
import {
  getDailyStatsForDate,
  getWeeklyStats,
  getStreakDays,
  subscribeToActivityLogs,
} from "../lib/firestoreQueries";
import type {
  ActivityLog,
  DailyStats,
  TimelineBlock,
  HeatmapCell,
  OverviewStats,
  AppUsage,
  SessionRecord,
  AttentionSlice,
  DashboardKpis,
  ActivityEvent,
} from "../../../shared/types";
import { toFocusLevel } from "../../../shared/types";

const PALETTE = ["#58f0ff", "#7b6bff", "#ff8ad6", "#6ef5b1", "#ffcb74", "#f97373"];

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

/* ── Log → TimelineBlock[] ────────────────────────────────────────────── */
export function logsToTimeline(logs: ActivityLog[]): TimelineBlock[] {
  const buckets = new Map<number, { totalDur: number; productiveDur: number; distractionDur: number; domains: Map<string, number> }>();

  for (const log of logs) {
    const hour = new Date(log.startTime).getHours();
    if (!buckets.has(hour)) {
      buckets.set(hour, { totalDur: 0, productiveDur: 0, distractionDur: 0, domains: new Map() });
    }
    const b = buckets.get(hour)!;
    b.totalDur += log.duration;
    if (log.category === "productive") b.productiveDur += log.duration;
    if (log.category === "distraction") b.distractionDur += log.duration;
    b.domains.set(log.domain, (b.domains.get(log.domain) ?? 0) + log.duration);
  }

  const blocks: TimelineBlock[] = [];
  for (const [hour, b] of [...buckets.entries()].sort((a, c) => a[0] - c[0])) {
    const focusScore = b.totalDur > 0
      ? Math.round(Math.min(100, Math.max(0, (b.productiveDur / b.totalDur) * 80 + (20 - (b.distractionDur / b.totalDur) * 40))))
      : 0;
    const topDomain = [...b.domains.entries()].sort((a, c) => c[1] - a[1])[0]?.[0] ?? "—";
    blocks.push({
      hour: `${String(hour).padStart(2, "0")}:00`,
      focusScore,
      activeMinutes: Math.round(b.totalDur / 60),
      dominantApp: topDomain,
      focusLevel: toFocusLevel(focusScore),
    });
  }
  return blocks;
}

/* ── Log → SessionRecord[] ────────────────────────────────────────────── */
export function logsToSessions(logs: ActivityLog[]): SessionRecord[] {
  if (!logs.length) return [];
  const sorted = [...logs].sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

  const sessions: SessionRecord[] = [];
  let sessionStart = sorted[0].startTime;
  let sessionEnd = sorted[0].endTime;
  let totalDuration = sorted[0].duration;
  let productiveDur = sorted[0].category === "productive" ? sorted[0].duration : 0;

  for (let i = 1; i < sorted.length; i++) {
    const log = sorted[i];
    const gap = new Date(log.startTime).getTime() - new Date(sessionEnd).getTime();

    if (gap < 5 * 60 * 1000) {
      // Continue session (gap < 5 min)
      sessionEnd = log.endTime;
      totalDuration += log.duration;
      if (log.category === "productive") productiveDur += log.duration;
    } else {
      // Commit session
      const durationMinutes = Math.round(totalDuration / 60);
      const score = totalDuration > 0 ? Math.round((productiveDur / totalDuration) * 100) : 0;
      sessions.push({
        id: `s-${sessions.length}`,
        start: sessionStart,
        end: sessionEnd,
        durationMinutes,
        focusLevel: toFocusLevel(score),
      });
      sessionStart = log.startTime;
      sessionEnd = log.endTime;
      totalDuration = log.duration;
      productiveDur = log.category === "productive" ? log.duration : 0;
    }
  }

  // Flush last session
  const durationMinutes = Math.round(totalDuration / 60);
  const score = totalDuration > 0 ? Math.round((productiveDur / totalDuration) * 100) : 0;
  sessions.push({
    id: `s-${sessions.length}`,
    start: sessionStart,
    end: sessionEnd,
    durationMinutes,
    focusLevel: toFocusLevel(score),
  });

  return sessions;
}

/* ── Log → AppUsage[] ─────────────────────────────────────────────────── */
export function logsToApps(logs: ActivityLog[]): AppUsage[] {
  const map = new Map<string, { dur: number; cat: string }>();
  for (const log of logs) {
    const existing = map.get(log.domain);
    if (existing) {
      existing.dur += log.duration;
    } else {
      map.set(log.domain, { dur: log.duration, cat: log.category });
    }
  }
  return [...map.entries()]
    .sort((a, b) => b[1].dur - a[1].dur)
    .slice(0, 10)
    .map(([name, { dur, cat }], i) => ({
      name,
      minutes: Math.round(dur / 60),
      color: PALETTE[i % PALETTE.length],
      category: cat,
    }));
}

/* ── Log → ActivityEvent[] ────────────────────────────────────────────── */
export function logsToEvents(logs: ActivityLog[]): ActivityEvent[] {
  return logs.map((log, i) => {
    const focusScore = log.category === "productive" ? 80 : log.category === "neutral" ? 55 : 25;
    return {
      id: log.id ?? `e-${i}`,
      title: log.title || log.domain,
      url: log.url,
      start: log.startTime,
      end: log.endTime,
      focusScore,
      category: log.category,
    };
  });
}

/* ── Log → AttentionSlice[] + Distraction Slice[] ─────────────────────── */
export function logsToAttentionSlices(logs: ActivityLog[]): { attention: AttentionSlice[]; distractions: AttentionSlice[] } {
  let prodSec = 0, neutSec = 0, distSec = 0;
  const distractionDomains = new Map<string, number>();

  for (const log of logs) {
    switch (log.category) {
      case "productive": prodSec += log.duration; break;
      case "neutral": neutSec += log.duration; break;
      case "distraction":
        distSec += log.duration;
        distractionDomains.set(log.domain, (distractionDomains.get(log.domain) ?? 0) + log.duration);
        break;
    }
  }
  const total = prodSec + neutSec + distSec || 1;

  const attention: AttentionSlice[] = [
    { label: "Productive", value: Math.round((prodSec / total) * 100), color: "#58f0ff" },
    { label: "Neutral", value: Math.round((neutSec / total) * 100), color: "#9c6bff" },
    { label: "Distraction", value: Math.round((distSec / total) * 100), color: "#ff8a8a" },
  ];

  const topDistractions = [...distractionDomains.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4);
  const dTotal = topDistractions.reduce((s, [, v]) => s + v, 0) || 1;
  const distractions: AttentionSlice[] = topDistractions.map(([domain, dur], i) => ({
    label: domain,
    value: Math.round((dur / dTotal) * 100),
    color: PALETTE[i % PALETTE.length],
  }));

  return { attention, distractions };
}

/* ── HeatmapCell[] from 7 days of DailyStats ──────────────────────────── */
export function statsToHeatmap(weeklyStats: DailyStats[]): HeatmapCell[] {
  const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const cells: HeatmapCell[] = [];

  // Fill a 7×24 grid; use domainBreakdown or hourly data if available, otherwise estimate from focusScore
  for (let day = 0; day < 7; day++) {
    const stat = weeklyStats[day];
    for (let hour = 0; hour < 24; hour++) {
      const baseIntensity = stat
        ? Math.min(1, stat.focusScore / 100 * (hour >= 8 && hour <= 22 ? 1 : 0.3))
        : 0;
      // Add some variation based on hour proximity to peak
      const peakProximity = stat?.peakHour != null
        ? 1 - Math.min(1, Math.abs(hour - stat.peakHour) / 8)
        : 0;
      const intensity = Math.min(1, Math.max(0, baseIntensity * 0.6 + peakProximity * 0.4));

      cells.push({
        day,
        hour,
        intensity,
        label: `${DAYS[day]} ${hour}:00`,
      });
    }
  }
  return cells;
}

/* ── KPIs from logs + sessions ────────────────────────────────────────── */
export function computeKpis(logs: ActivityLog[], sessions: SessionRecord[], timeline: TimelineBlock[]): DashboardKpis {
  // Context switches = transitions between different domains
  let switches = 0;
  for (let i = 1; i < logs.length; i++) {
    if (logs[i].domain !== logs[i - 1].domain) switches++;
  }

  const longestSession = sessions.length > 0
    ? Math.max(...sessions.map(s => s.durationMinutes))
    : 0;

  const deepBlocks = timeline.filter(b => b.focusLevel === "deep");
  const deepestBlock = deepBlocks.length > 0
    ? `${deepBlocks[0].hour} → ${deepBlocks[deepBlocks.length - 1].hour}`
    : "—";

  return {
    contextSwitches: switches,
    longestSession,
    deepestBlock,
    shippedArtifacts: deepBlocks.length,
  };
}

/* ══════════════════════════════════════════════════════════════════════════
 * Main hook: useDashboardData
 * ══════════════════════════════════════════════════════════════════════════ */
export function useDashboardData(dateStr?: string) {
  const { user } = useAuth();
  const date = dateStr ?? todayStr();
  const uid = user?.uid ?? "";

  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [dailyStats, setDailyStats] = useState<DailyStats | null>(null);
  const [weeklyStats, setWeeklyStats] = useState<DailyStats[]>([]);
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) return;
    setLoading(true);

    // Subscribe to real-time activity logs for the day
    const unsub = subscribeToActivityLogs(uid, date, (newLogs) => {
      setLogs(newLogs);
      setLoading(false);
    });

    // Fetch daily stats + weekly stats + streak
    getDailyStatsForDate(uid, date).then(setDailyStats);
    getWeeklyStats(uid).then(setWeeklyStats);
    getStreakDays(uid).then(setStreak);

    return unsub;
  }, [uid, date]);

  // Derived view models
  const timeline = useMemo(() => logsToTimeline(logs), [logs]);
  const sessions = useMemo(() => logsToSessions(logs), [logs]);
  const apps = useMemo(() => logsToApps(logs), [logs]);
  const events = useMemo(() => logsToEvents(logs), [logs]);
  const { attention, distractions } = useMemo(() => logsToAttentionSlices(logs), [logs]);
  const heatmap = useMemo(() => statsToHeatmap(weeklyStats), [weeklyStats]);
  const kpis = useMemo(() => computeKpis(logs, sessions, timeline), [logs, sessions, timeline]);

  const overview: OverviewStats | null = useMemo(() => {
    if (!logs.length && !dailyStats) return null;
    const focusScore = dailyStats?.focusScore ?? (timeline.length > 0
      ? Math.round(timeline.reduce((s, b) => s + b.focusScore, 0) / timeline.length)
      : 0);
    const totalActiveMinutes = dailyStats
      ? Math.round(dailyStats.totalDuration / 60)
      : Math.round(logs.reduce((s, l) => s + l.duration, 0) / 60);
    const distractionCount = logs.filter(l => l.category === "distraction").length;
    const topCategory = apps.length > 0 ? apps[0].name : "—";

    return {
      focusScore,
      totalActiveMinutes,
      distractionCount,
      streakDays: streak,
      topCategory,
    };
  }, [logs, dailyStats, timeline, apps, streak]);

  return {
    logs,
    dailyStats,
    weeklyStats,
    overview,
    timeline,
    sessions,
    apps,
    events,
    attention,
    distractions,
    heatmap,
    kpis,
    streak,
    loading,
  };
}
