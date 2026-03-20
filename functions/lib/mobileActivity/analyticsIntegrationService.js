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
exports.buildCombinedAnalytics = buildCombinedAnalytics;
exports.integrateMobileAnalyticsForDate = integrateMobileAnalyticsForDate;
const admin = __importStar(require("firebase-admin"));
if (!admin.apps.length)
    admin.initializeApp();
const db = admin.firestore();
function buildCombinedAnalytics(dateStr, mobile, desktop) {
    const desktopScreenTimeMinutes = Math.max(0, Math.round(desktop.desktopScreenTimeMinutes ??
        ((desktop.totalDuration ?? 0) / 60)));
    const learningActivityMinutes = Math.max(0, Math.round(desktop.learningActivityMinutes ??
        ((desktop.productiveTime ?? 0) / 60)));
    const longSedentaryStudyPeriods = Math.max(0, Math.round(desktop.longSedentaryStudyPeriods ?? 0));
    const dailyStepCount = Math.max(0, Math.round(mobile.step_count));
    const activeMovementMinutes = Math.max(0, Math.round(mobile.active_minutes));
    return {
        date: dateStr,
        desktopScreenTimeMinutes,
        learningActivityMinutes,
        dailyStepCount,
        activeMovementMinutes,
        highScreenUsageLowPhysicalActivity: desktopScreenTimeMinutes >= 240 && (dailyStepCount < 3000 || activeMovementMinutes < 20),
        healthyLearningMovementBalance: learningActivityMinutes >= 120 && activeMovementMinutes >= 30 && dailyStepCount >= 6000,
        longSedentaryStudyPeriods,
        longSedentaryStudyDetected: longSedentaryStudyPeriods > 0,
    };
}
async function integrateMobileAnalyticsForDate(uid, mobile) {
    const dateStr = mobile.date;
    const dailyStatsRef = db.doc(`users/${uid}/dailyStats/${dateStr}`);
    const combinedRef = db.doc(`users/${uid}/combined_analytics/${dateStr}`);
    const dailyStatsSnap = await dailyStatsRef.get();
    const dailyStats = dailyStatsSnap.data() ?? {};
    const combined = buildCombinedAnalytics(dateStr, mobile, dailyStats);
    await Promise.all([
        dailyStatsRef.set({
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
        }, { merge: true }),
        combinedRef.set({
            ...combined,
            updatedAt: new Date().toISOString(),
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        }, { merge: true }),
    ]);
}
//# sourceMappingURL=analyticsIntegrationService.js.map