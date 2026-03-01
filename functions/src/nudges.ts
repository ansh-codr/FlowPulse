import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

if (!admin.apps.length) admin.initializeApp();
const db = admin.firestore();

interface DailyStats {
  date: string;
  focusScore: number;
  productiveSec: number;
  neutralSec: number;
  distractionSec: number;
  totalSec: number;
  deepBlocks: number;
}

/**
 * Triggered when a dailyStats doc is created/updated.
 * Generates contextual nudges based on the user's activity patterns.
 */
export const generateNudges = functions.firestore
  .document("users/{userId}/dailyStats/{dateId}")
  .onWrite(async (change, context) => {
    const { userId, dateId } = context.params;
    const data = change.after.data() as DailyStats | undefined;
    if (!data) return; // deleted

    const nudges: Array<{
      type: "break" | "refocus" | "low_movement" | "sleep_warning";
      message: string;
      priority: "low" | "medium" | "high";
    }> = [];

    // ── Break nudge: too many hours without pause ──
    if (data.totalSec > 6 * 3600 && data.deepBlocks < 2) {
      nudges.push({
        type: "break",
        message: "You've been active for over 6 hours today. Take a short walk — your brain will thank you!",
        priority: "medium",
      });
    }

    // ── Refocus nudge: high distraction ratio ──
    if (data.totalSec > 1800) {
      const distractionRatio = data.distractionSec / data.totalSec;
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

    // ── Sleep warning: activity logged very late ──
    // If dateId indicates data and totalSec > 8 hours, user was on screens a LOT
    if (data.totalSec > 8 * 3600) {
      nudges.push({
        type: "sleep_warning",
        message: "Over 8 hours of screen time today — consider winding down early tonight.",
        priority: "medium",
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

    if (nudges.length === 0) return;

    // Write nudges
    const batch = db.batch();
    for (const nudge of nudges) {
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
      `generateNudges: created ${nudges.length} nudges for user ${userId} on ${dateId}`
    );
  });
