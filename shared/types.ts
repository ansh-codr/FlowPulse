// ─── FlowPulse shared types ──────────────────────────────────────────────────
// Canonical type definitions shared between dashboard, extension, and functions.

/* ── Category & Focus ─────────────────────────────────────────────────────── */

/** Activity categories aligned with document.txt spec */
export type ActivityCategory = "productive" | "neutral" | "distraction";

/** Derived focus-level buckets for UI display (from 0-100 focusScore) */
export type FocusLevel = "deep" | "flow" | "shallow" | "distracted";

/** Derive FocusLevel from a numeric score */
export function toFocusLevel(score: number): FocusLevel {
  if (score > 80) return "deep";
  if (score > 65) return "flow";
  if (score > 45) return "shallow";
  return "distracted";
}

/* ── Firestore document shapes ────────────────────────────────────────────── */

/** users/{uid} */
export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  createdAt: string; // ISO timestamp
}

/** users/{uid}/settings/preferences */
export interface UserSettings {
  trackingEnabled: boolean;
  blockedDomains: string[];
  timezone: string; // e.g. "America/New_York"
}

/** users/{uid}/activityLogs/{docId} */
export interface ActivityLog {
  id?: string; // Firestore doc ID (populated on read)
  url: string;
  domain: string;
  title: string;
  category: ActivityCategory;
  startTime: string; // ISO timestamp
  endTime: string;   // ISO timestamp
  duration: number;  // seconds
}

/** users/{uid}/dailyStats/{YYYY-MM-DD} */
export interface DailyStats {
  date: string; // YYYY-MM-DD
  totalDuration: number;      // seconds
  productiveTime: number;     // seconds
  distractionTime: number;    // seconds
  neutralTime: number;        // seconds
  topDomains: DomainStat[];
  peakHour: number;           // 0-23
  focusScore: number;         // 0-100
  contextSwitches: number;
  domainBreakdown: Record<string, number>; // domain → seconds
  updatedAt: string; // ISO timestamp
}

export interface DomainStat {
  domain: string;
  duration: number; // seconds
  category: ActivityCategory;
}

/** users/{uid}/nudges/{docId} */
export interface Nudge {
  id?: string;
  type: "break" | "refocus" | "low_movement" | "sleep_warning";
  message: string;
  timestamp: string; // ISO
  dismissed: boolean;
}

/** leaderboard/{weekId}/entries/{entryId} */
export interface LeaderboardEntry {
  rank: number;
  anonymousNickname: string;
  avgFocusScore: number;
  deepWorkBlocks: number;
  percentile: number; // 0-100
  userId: string; // hidden from client reads (only used server-side)
}

/* ── Dashboard view models ────────────────────────────────────────────────── */

/** Hour-by-hour timeline blocks (computed client-side from ActivityLog[]) */
export interface TimelineBlock {
  hour: string; // e.g. "09:00"
  focusScore: number;
  activeMinutes: number;
  dominantApp: string;
  focusLevel: FocusLevel;
}

/** 7×24 heatmap cell */
export interface HeatmapCell {
  day: number;   // 0-6 (Mon-Sun)
  hour: number;  // 0-23
  intensity: number; // 0-1
  label: string;
}

/** Overview stats for the command center */
export interface OverviewStats {
  focusScore: number;
  totalActiveMinutes: number;
  distractionCount: number;
  streakDays: number;
  topCategory: string;
}

/** App/domain usage for pie charts */
export interface AppUsage {
  name: string;
  minutes: number;
  color: string;
  category: string;
}

/** Session record (derived from contiguous activity logs) */
export interface SessionRecord {
  id: string;
  start: string;
  end: string;
  durationMinutes: number;
  focusLevel: FocusLevel;
  notes?: string;
}

/** Pie chart slice */
export interface AttentionSlice {
  label: string;
  value: number;
  color: string;
}

/** KPI summary for the command center */
export interface DashboardKpis {
  contextSwitches: number;
  longestSession: number;
  deepestBlock: string;
  shippedArtifacts: number;
}
