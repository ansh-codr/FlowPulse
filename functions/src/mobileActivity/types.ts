export interface MobileActivitySummaryRow {
  user_id: string;
  date: string;
  step_count: number;
  active_minutes: number;
  activity_sessions: number;
}

export interface MobileDailySummaryInput {
  date: string;
  step_count: number;
  active_minutes: number;
  activity_sessions: number;
}

export interface ValidatedMobileIngestBody {
  source: "google_health_connect";
  consent: true;
  summaries: MobileDailySummaryInput[];
}

export function isIsoDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}
