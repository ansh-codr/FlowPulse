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
exports.upsertMobileActivitySummary = upsertMobileActivitySummary;
exports.upsertMobileActivitySummaries = upsertMobileActivitySummaries;
const admin = __importStar(require("firebase-admin"));
const analyticsIntegrationService_1 = require("./analyticsIntegrationService");
if (!admin.apps.length)
    admin.initializeApp();
const db = admin.firestore();
function mobileSummaryRef(uid, dateStr) {
    return db.doc(`users/${uid}/mobile_activity_summary/${dateStr}`);
}
function sanitizeDailySummary(summary) {
    return {
        date: summary.date,
        step_count: Math.max(0, Math.round(summary.step_count)),
        active_minutes: Math.max(0, Math.round(summary.active_minutes)),
        activity_sessions: Math.max(0, Math.round(summary.activity_sessions)),
    };
}
async function upsertMobileActivitySummary(uid, summary) {
    const sanitized = sanitizeDailySummary(summary);
    const payload = {
        user_id: uid,
        date: sanitized.date,
        step_count: sanitized.step_count,
        active_minutes: sanitized.active_minutes,
        activity_sessions: sanitized.activity_sessions,
        created_at: admin.firestore.FieldValue.serverTimestamp(),
    };
    await mobileSummaryRef(uid, sanitized.date).set(payload, { merge: true });
    await (0, analyticsIntegrationService_1.integrateMobileAnalyticsForDate)(uid, sanitized);
}
async function upsertMobileActivitySummaries(uid, summaries) {
    for (const summary of summaries) {
        await upsertMobileActivitySummary(uid, summary);
    }
}
//# sourceMappingURL=storageService.js.map