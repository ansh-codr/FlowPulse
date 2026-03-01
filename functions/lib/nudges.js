"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateNudges = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
if (!admin.apps.length)
    admin.initializeApp();
const db = admin.firestore();
/**
 * Triggered when a dailyStats doc is created/updated.
 * Generates contextual nudges based on the user's activity patterns.
 */
exports.generateNudges = functions.firestore
    .document("users/{userId}/dailyStats/{dateId}")
    .onWrite(async (change, context) => {
    const { userId, dateId } = context.params;
    const data = change.after.data();
    if (!data)
        return; // deleted
    const nudges = [];
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
        }
        else if (distractionRatio > 0.25) {
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
    if (nudges.length === 0)
        return;
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
    functions.logger.info(`generateNudges: created ${nudges.length} nudges for user ${userId} on ${dateId}`);
});
//# sourceMappingURL=nudges.js.map