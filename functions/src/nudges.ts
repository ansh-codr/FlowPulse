import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

if (!admin.apps.length) admin.initializeApp();
const db = admin.firestore();

interface DailyStats {
  date: string;
  focusScore: number;
  productiveTime: number;
  neutralTime: number;
  distractionTime: number;
  totalDuration: number;
  deepBlocks: number;
  contextSwitches?: number;
  microDistractions?: number;
  rapidSwitchBursts?: number;
  socialMediaLoops?: Array<{ platform: string; visits: number }>;
  dopamineCycles?: number;
  peakDistractionHours?: number[];
  mobileStepCount?: number;
  mobileActiveMinutes?: number;
  mobileActivitySessions?: number;
  highScreenTimeLowSteps?: boolean;
  longFocusWithoutMovement?: boolean;
  balancedLearningAndMovement?: boolean;
}

type NudgeType = "break" | "refocus" | "low_movement" | "sleep_warning" | 
                  "rapid_switch" | "social_media_loop" | "dopamine_cycle" |
                  "context_switch" | "peak_distraction" | "deep_work_celebration";

/**
 * Triggered when a dailyStats doc is created/updated.
 * Generates contextual nudges based on the user's activity patterns.
 */
export const generateNudges = functions.firestore
  .document("users/{userId}/dailyStats/{dateId}")
  .onCreate(async (snapshot, context) => {
    const { userId, dateId } = context.params;
    const data = snapshot.data() as DailyStats | undefined;
    if (!data) return;

    const nudges: Array<{
      type: NudgeType;
      message: string;
      priority: "low" | "medium" | "high";
    }> = [];

    // ── Break nudge: too many hours without pause ──
    if (data.totalDuration > 6 * 3600 && data.deepBlocks < 2) {
      nudges.push({
        type: "break",
        message: "You've been active for over 6 hours today. Take a short walk — your brain will thank you!",
        priority: "medium",
      });
    }

    // ── Refocus nudge: high distraction ratio ──
    if (data.totalDuration > 1800) {
      const distractionRatio = data.distractionTime / data.totalDuration;
      if (distractionRatio > 0.4) {
        nudges.push({
          type: "refocus",
          message: `${Math.round(distractionRatio * 100)}% of your screen time today was on distracting sites. Try blocking them for a focused sprint.`,
          priority: "high",
        });
      } else if (distractionRatio > 0.25) {
        nudges.push({
          type: "refocus",
          message: "Your distraction ratio is creeping up. A 25-minute focus block could help reset your flow.",
          priority: "low",
        });
      }
    }

    // ── Sleep warning: excessive screen time ──
    if (data.totalDuration > 8 * 3600) {
      nudges.push({
        type: "sleep_warning",
        message: "Over 8 hours of screen time today — consider winding down early tonight.",
        priority: "medium",
      });
    }

    // ── Rapid switch burst detection ──
    if (data.rapidSwitchBursts && data.rapidSwitchBursts >= 3) {
      nudges.push({
        type: "rapid_switch",
        message: `${data.rapidSwitchBursts} rapid-switch bursts detected today. Your attention was fragmented — try single-tasking tomorrow.`,
        priority: "medium",
      });
    }

    // ── Social media loop detection ──
    if (data.socialMediaLoops && data.socialMediaLoops.length > 0) {
      const topLoop = data.socialMediaLoops[0];
      if (topLoop.visits >= 5) {
        nudges.push({
          type: "social_media_loop",
          message: `You visited ${topLoop.platform} ${topLoop.visits} times today. Consider using a site blocker during work hours.`,
          priority: "high",
        });
      } else if (topLoop.visits >= 3) {
        nudges.push({
          type: "social_media_loop",
          message: `${topLoop.platform} pulled you back ${topLoop.visits} times. Batch your social media time to protect focus.`,
          priority: "low",
        });
      }
    }

    // ── Dopamine cycle detection ──
    if (data.dopamineCycles && data.dopamineCycles >= 5) {
      nudges.push({
        type: "dopamine_cycle",
        message: `${data.dopamineCycles} quick social media breaks mid-work detected. These micro-interruptions compound — try staying off social completely during deep work.`,
        priority: "medium",
      });
    }

    // ── Context switching overload ──
    if (data.contextSwitches && data.contextSwitches > 50) {
      nudges.push({
        type: "context_switch",
        message: `${data.contextSwitches} context switches today! Each switch costs cognitive energy. Group similar tasks together tomorrow.`,
        priority: "medium",
      });
    }

    // ── Peak distraction hour warning ──
    if (data.peakDistractionHours && data.peakDistractionHours.length > 0) {
      const peakHour = data.peakDistractionHours[0];
      const timeStr = `${peakHour}:00-${(peakHour + 1) % 24}:00`;
      nudges.push({
        type: "peak_distraction",
        message: `Your peak distraction hour was ${timeStr}. Schedule breaks during this time, or use it for low-focus tasks.`,
        priority: "low",
      });
    }

    // ── Positive reinforcement / low-movement ──
    if (data.focusScore >= 80 && data.deepBlocks >= 3) {
      nudges.push({
        type: "low_movement",
        message: "Amazing focus today! Remember to stand up and stretch — sustained sitting can slow you down tomorrow.",
        priority: "low",
      });
    }

    // ── Cross-device signal: high screen time + low movement ──
    if (data.highScreenTimeLowSteps) {
      nudges.push({
        type: "low_movement",
        message: "Screen usage exceeded recommended duration. Consider taking a short walk.",
        priority: "high",
      });
    }

    // ── Cross-device signal: long focus without movement ──
    if (data.longFocusWithoutMovement) {
      nudges.push({
        type: "low_movement",
        message: "Learning activity was high but physical movement was low.",
        priority: "medium",
      });
    }

    // ── Positive cross-device balance signal ──
    if (data.balancedLearningAndMovement) {
      nudges.push({
        type: "deep_work_celebration",
        message: "Healthy balance between study and movement detected.",
        priority: "low",
      });
    }

    // ── Deep work celebration ──
    if (data.deepBlocks >= 4) {
      nudges.push({
        type: "deep_work_celebration",
        message: `🎉 ${data.deepBlocks} deep work sessions today! You're building serious momentum. Keep this rhythm going.`,
        priority: "low",
      });
    }

    if (nudges.length === 0) return;

    // Write nudges (limit to top 3 by priority to avoid overwhelming)
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    const sortedNudges = nudges
      .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
      .slice(0, 3);

    const batch = db.batch();
    for (const nudge of sortedNudges) {
      const ref = db.collection(`users/${userId}/nudges`).doc();
      batch.set(ref, {
        ...nudge,
        date: dateId,
        dismissed: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }
    await batch.commit();

    functions.logger.info(
      `generateNudges: created ${sortedNudges.length} nudges for user ${userId} on ${dateId}`
    );
  });
