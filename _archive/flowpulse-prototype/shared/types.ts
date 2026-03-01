export type FocusLevel = "deep" | "flow" | "shallow" | "distracted";

export interface ActivityEvent {
  id: string;
  title: string;
  url: string;
  start: string; // ISO timestamp
  end: string; // ISO timestamp
  focusScore: number; // 0-100
  category: "work" | "social" | "entertainment" | "utility" | "other";
}

export interface TimelineBlock {
  hour: string; // e.g., "09:00"
  focusScore: number;
  activeMinutes: number;
  dominantApp: string;
  focusLevel: FocusLevel;
}

export interface HeatmapCell {
  day: number; // 0-6 starting Monday
  hour: number; // 0-23
  intensity: number; // 0-1
  label: string;
}

export interface OverviewStats {
  focusScore: number;
  totalActiveMinutes: number;
  distractionCount: number;
  streakDays: number;
  topCategory: string;
}

export interface AppUsage {
  name: string;
  minutes: number;
  color: string;
  category: string;
}

export interface SessionRecord {
  id: string;
  start: string;
  end: string;
  durationMinutes: number;
  focusLevel: FocusLevel;
  notes?: string;
}

export interface AttentionSlice {
  label: string;
  value: number;
  color: string;
}

export interface DashboardKpis {
  contextSwitches: number;
  longestSession: number;
  deepestBlock: string;
  shippedArtifacts: number;
}
