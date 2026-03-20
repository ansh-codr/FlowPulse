import * as admin from "firebase-admin";
import { MobileDailySummaryInput } from "./types";

if (!admin.apps.length) admin.initializeApp();
const db = admin.firestore();

interface DailyStatsSnapshot {
  totalDuration?: number;
  productiveTime?: number;
  desktopScreenTimeMinutes?: number;
  learningActivityMinutes?: number;
  longSedentaryStudyPeriods?: number;
}

export interface CombinedAnalyticsDaily {
  date: string;
  desktopScreenTimeMinutes: number;
  learningActivityMinutes: number;
  dailyStepCount: number;
  activeMovementMinutes: number;
  highScreenUsageLowPhysicalActivity: boolean;
  healthyLearningMovementBalance: boolean;
  longSedentaryStudyPeriods: number;
  longSedentaryStudyDetected: boolean;
}

export function buildCombinedAnalytics(
  dateStr: string,
  mobile: MobileDailySummaryInput,
  desktop: DailyStatsSnapshot
): CombinedAnalyticsDaily {
  const desktopScreenTimeMinutes = Math.max(
    0,
    Math.round(
      desktop.desktopScreenTimeMinutes ??
        ((desktop.totalDuration ?? 0) / 60)
    )
  );
  const learningActivityMinutes = Math.max(
    0,
    Math.round(
      desktop.learningActivityMinutes ??
        ((desktop.productiveTime ?? 0) / 60)
    )
  );
  const longSedentaryStudyPeriods = Math.max(0, Math.round(desktop.longSedentaryStudyPeriods ?? 0));

  const dailyStepCount = Math.max(0, Math.round(mobile.step_count));
  const activeMovementMinutes = Math.max(0, Math.round(mobile.active_minutes));

  return {
    date: dateStr,
    desktopScreenTimeMinutes,
    learningActivityMinutes,
    dailyStepCount,
    activeMovementMinutes,
    highScreenUsageLowPhysicalActivity:
      desktopScreenTimeMinutes >= 240 && (dailyStepCount < 3000 || activeMovementMinutes < 20),
    healthyLearningMovementBalance:
      learningActivityMinutes >= 120 && activeMovementMinutes >= 30 && dailyStepCount >= 6000,
    longSedentaryStudyPeriods,
    longSedentaryStudyDetected: longSedentaryStudyPeriods > 0,
  };
}

export async function integrateMobileAnalyticsForDate(uid: string, mobile: MobileDailySummaryInput): Promise<void> {
  const dateStr = mobile.date;
  const dailyStatsRef = db.doc(`users/${uid}/dailyStats/${dateStr}`);
  const combinedRef = db.doc(`users/${uid}/combined_analytics/${dateStr}`);

  const dailyStatsSnap = await dailyStatsRef.get();
  const dailyStats = (dailyStatsSnap.data() as DailyStatsSnapshot | undefined) ?? {};
  const combined = buildCombinedAnalytics(dateStr, mobile, dailyStats);

  await Promise.all([
    dailyStatsRef.set(
      {
        mobileStepCount: combined.dailyStepCount,
        mobileActiveMinutes: combined.activeMovementMinutes,
        mobileActivitySessions: Math.max(0, Math.round(mobile.activity_sessions)),
        desktopScreenTimeMinutes: combined.desktopScreenTimeMinutes,
        learningActivityMinutes: combined.learningActivityMinutes,
        dailyStepCount: combined.dailyStepCount,
        activeMovementMinutes: combined.activeMovementMinutes,
        highScreenUsageLowPhysicalActivity: combined.highScreenUsageLowPhysicalActivity,
        healthyLearningMovementBalance: combined.healthyLearningMovementBalance,
        longSedentaryStudyPeriods: combined.longSedentaryStudyPeriods,
        longSedentaryStudyDetected: combined.longSedentaryStudyDetected,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    ),
    combinedRef.set(
      {
        ...combined,
        updatedAt: new Date().toISOString(),
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    ),
  ]);
}
