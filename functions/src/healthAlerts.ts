import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

if (!admin.apps.length) admin.initializeApp();
const db = admin.firestore();

interface CombinedAnalyticsDaily {
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

type HealthAlertType =
  | "screen_usage_threshold"
  | "low_step_count"
  | "focus_without_movement"
  | "long_study_without_break"
  | "healthy_balance";

interface HealthAlert {
  type: HealthAlertType;
  message: string;
  priority: "low" | "medium" | "high";
}

const SCREEN_TIME_THRESHOLD_MINUTES = 240;
const MIN_DAILY_STEP_TARGET = 6000;
const LONG_FOCUS_WITHOUT_MOVEMENT_MINUTES = 120;
const MIN_ACTIVE_MOVEMENT_FOR_LONG_FOCUS = 15;

function alertsRef(userId: string) {
  return db.collection(`users/${userId}/health_alerts`);
}

function buildHealthAlerts(data: CombinedAnalyticsDaily): HealthAlert[] {
  const alerts: HealthAlert[] = [];

  if (
    data.desktopScreenTimeMinutes >= SCREEN_TIME_THRESHOLD_MINUTES ||
    data.highScreenUsageLowPhysicalActivity
  ) {
    alerts.push({
      type: "screen_usage_threshold",
      priority: "high",
      message: "High screen usage detected. Consider a break.",
    });
  }

  if (data.dailyStepCount < MIN_DAILY_STEP_TARGET) {
    alerts.push({
      type: "low_step_count",
      priority: "medium",
      message: "Low movement detected. Take a short walk.",
    });
  }

  if (
    data.learningActivityMinutes >= LONG_FOCUS_WITHOUT_MOVEMENT_MINUTES &&
    data.activeMovementMinutes < MIN_ACTIVE_MOVEMENT_FOR_LONG_FOCUS
  ) {
    alerts.push({
      type: "focus_without_movement",
      priority: "high",
      message: "Long focus without movement detected. Stand up, stretch, and walk for 5 minutes.",
    });
  }

  if (data.longSedentaryStudyDetected || data.longSedentaryStudyPeriods > 0) {
    alerts.push({
      type: "long_study_without_break",
      priority: "high",
      message: "Long study session detected without breaks. Pause and move for a few minutes.",
    });
  }

  if (data.healthyLearningMovementBalance) {
    alerts.push({
      type: "healthy_balance",
      priority: "low",
      message: "Great balance today. Keep alternating focused study with movement.",
    });
  }

  return alerts;
}

/**
 * Triggered when combined daily analytics are written.
 * Stores short, actionable health awareness alerts for dashboard display.
 */
export const generateHealthAlerts = functions.firestore
  .document("users/{userId}/combined_analytics/{dateId}")
  .onWrite(async (change, context) => {
    const { userId, dateId } = context.params;

    if (!change.after.exists) {
      return;
    }

    const data = change.after.data() as CombinedAnalyticsDaily | undefined;
    if (!data) {
      return;
    }

    const alerts = buildHealthAlerts(data);
    if (alerts.length === 0) {
      return;
    }

    const batch = db.batch();

    // Deterministic IDs avoid duplicate alerts when daily analytics doc updates.
    for (const alert of alerts) {
      const ref = alertsRef(userId).doc(`${dateId}_${alert.type}`);
      batch.set(
        ref,
        {
          date: dateId,
          type: alert.type,
          message: alert.message,
          priority: alert.priority,
          dismissed: false,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
    }

    await batch.commit();
    functions.logger.info(`generateHealthAlerts: wrote ${alerts.length} alerts for ${userId} on ${dateId}`);
  });
