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
exports.dailyAggregation = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
if (!admin.apps.length)
    admin.initializeApp();
const db = admin.firestore();
/**
 * Runs daily at 3 AM UTC.
 * For each user, aggregates yesterday's activityLogs into a single dailyStats doc.
 */
exports.dailyAggregation = functions.pubsub
    .schedule("0 3 * * *")
    .timeZone("UTC")
    .onRun(async () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const dateStr = yesterday.toISOString().slice(0, 10); // YYYY-MM-DD
    const startOfDay = new Date(dateStr + "T00:00:00Z");
    const endOfDay = new Date(dateStr + "T23:59:59.999Z");
    const usersSnap = await db.collection("users").get();
    const batch = db.batch();
    let writes = 0;
    for (const userDoc of usersSnap.docs) {
        const uid = userDoc.id;
        const logsSnap = await db
            .collection(`users/${uid}/activityLogs`)
            .where("startTime", ">=", admin.firestore.Timestamp.fromDate(startOfDay))
            .where("startTime", "<=", admin.firestore.Timestamp.fromDate(endOfDay))
            .get();
        if (logsSnap.empty)
            continue;
        let productiveSec = 0;
        let neutralSec = 0;
        let distractionSec = 0;
        let totalSec = 0;
        const domainMap = new Map();
        for (const doc of logsSnap.docs) {
            const log = doc.data();
            const dur = log.durationSec || 0;
            totalSec += dur;
            switch (log.category) {
                case "productive":
                    productiveSec += dur;
                    break;
                case "distraction":
                    distractionSec += dur;
                    break;
                default:
                    neutralSec += dur;
            }
            const existing = domainMap.get(log.domain);
            if (existing) {
                existing.totalSec += dur;
            }
            else {
                domainMap.set(log.domain, {
                    domain: log.domain,
                    totalSec: dur,
                    category: log.category,
                });
            }
        }
        // Focus score: productive% weighted, penalise distractions
        const focusScore = totalSec > 0
            ? Math.round(Math.min(100, Math.max(0, ((productiveSec / totalSec) * 80) +
                (20 - (distractionSec / totalSec) * 40))))
            : 0;
        // Count deep focus blocks (>25 min productive streaks)
        const deepBlocks = countDeepBlocks(logsSnap.docs.map(d => d.data()));
        // Top 10 domains by time
        const topDomains = [...domainMap.values()]
            .sort((a, b) => b.totalSec - a.totalSec)
            .slice(0, 10);
        const statsRef = db.doc(`users/${uid}/dailyStats/${dateStr}`);
        batch.set(statsRef, {
            date: dateStr,
            focusScore,
            productiveSec,
            neutralSec,
            distractionSec,
            totalSec,
            deepBlocks,
            topDomains,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        writes++;
    }
    if (writes > 0) {
        await batch.commit();
        functions.logger.info(`dailyAggregation: wrote ${writes} dailyStats for ${dateStr}`);
    }
    return null;
});
/**
 * Count consecutive productive sessions ≥25 min as "deep focus blocks".
 */
function countDeepBlocks(logs) {
    const sorted = logs
        .filter(l => l.category === "productive")
        .sort((a, b) => a.startTime.toMillis() - b.startTime.toMillis());
    let blocks = 0;
    let currentStreak = 0;
    for (const log of sorted) {
        currentStreak += log.durationSec;
        if (currentStreak >= 25 * 60) {
            blocks++;
            currentStreak = 0;
        }
    }
    return blocks;
}
//# sourceMappingURL=dailyAggregation.js.map