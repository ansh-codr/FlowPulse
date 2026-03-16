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
exports.generateHealthAlerts = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
if (!admin.apps.length)
    admin.initializeApp();
const db = admin.firestore();
const SCREEN_TIME_THRESHOLD_MINUTES = 240;
const MIN_DAILY_STEP_TARGET = 6000;
const LONG_FOCUS_WITHOUT_MOVEMENT_MINUTES = 120;
const MIN_ACTIVE_MOVEMENT_FOR_LONG_FOCUS = 15;
function alertsRef(userId) {
    return db.collection(`users/${userId}/health_alerts`);
}
function buildHealthAlerts(data) {
    const alerts = [];
    if (data.desktopScreenTimeMinutes >= SCREEN_TIME_THRESHOLD_MINUTES ||
        data.highScreenUsageLowPhysicalActivity) {
        alerts.push({
            type: "screen_usage_threshold",
            priority: "high",
            message: "Screen usage is high today. Take a 10-minute walk break now.",
        });
    }
    if (data.dailyStepCount < MIN_DAILY_STEP_TARGET) {
        alerts.push({
            type: "low_step_count",
            priority: "medium",
            message: "Step count is below target. Add a short movement break this hour.",
        });
    }
    if (data.learningActivityMinutes >= LONG_FOCUS_WITHOUT_MOVEMENT_MINUTES &&
        data.activeMovementMinutes < MIN_ACTIVE_MOVEMENT_FOR_LONG_FOCUS) {
        alerts.push({
            type: "focus_without_movement",
            priority: "high",
            message: "Long focus without movement detected. Stand up, stretch, and walk for 5 minutes.",
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
exports.generateHealthAlerts = functions.firestore
    .document("users/{userId}/combined_analytics/{dateId}")
    .onWrite(async (change, context) => {
    const { userId, dateId } = context.params;
    if (!change.after.exists) {
        return;
    }
    const data = change.after.data();
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
        batch.set(ref, {
            date: dateId,
            type: alert.type,
            message: alert.message,
            priority: alert.priority,
            dismissed: false,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        }, { merge: true });
    }
    await batch.commit();
    functions.logger.info(`generateHealthAlerts: wrote ${alerts.length} alerts for ${userId} on ${dateId}`);
});
//# sourceMappingURL=healthAlerts.js.map