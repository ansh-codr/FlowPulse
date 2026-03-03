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
exports.computeLeaderboard = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
if (!admin.apps.length)
    admin.initializeApp();
const db = admin.firestore();
// Anonymous animal + adjective combos for privacy
const ADJECTIVES = [
    "Swift", "Silent", "Bright", "Calm", "Bold", "Keen", "Quick", "Wise",
    "Brave", "Witty", "Vivid", "Eager", "Noble", "Lively", "Steady",
];
const ANIMALS = [
    "Falcon", "Otter", "Fox", "Owl", "Wolf", "Hawk", "Bear", "Lynx",
    "Puma", "Raven", "Eagle", "Heron", "Stag", "Tiger", "Crane",
];
function generateNickname(uid) {
    // Deterministic based on uid hash so it stays consistent
    let hash = 0;
    for (let i = 0; i < uid.length; i++) {
        hash = ((hash << 5) - hash + uid.charCodeAt(i)) | 0;
    }
    const adj = ADJECTIVES[Math.abs(hash) % ADJECTIVES.length];
    const animal = ANIMALS[Math.abs(hash >> 8) % ANIMALS.length];
    return `${adj} ${animal}`;
}
/**
 * Runs at 3:15 AM UTC (after daily aggregation).
 * Computes weekly leaderboard from the last 7 days of dailyStats.
 */
exports.computeLeaderboard = functions.pubsub
    .schedule("15 3 * * *")
    .timeZone("UTC")
    .onRun(async () => {
    const now = new Date();
    // ISO week ID: YYYY-Www
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay()); // Sunday
    const weekId = weekStart.toISOString().slice(0, 10);
    // Get dates for last 7 days
    const dates = [];
    for (let i = 0; i < 7; i++) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        dates.push(d.toISOString().slice(0, 10));
    }
    const usersSnap = await db.collection("users").get();
    const scores = [];
    // Get dates for last 14 days (for improvement calculation)
    const twoWeekDates = [];
    for (let i = 0; i < 14; i++) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        twoWeekDates.push(d.toISOString().slice(0, 10));
    }
    for (const userDoc of usersSnap.docs) {
        const uid = userDoc.id;
        // Check if user opted into leaderboard (default: true)
        const settingsSnap = await db.doc(`users/${uid}/settings/preferences`).get();
        const settings = settingsSnap.data();
        if (settings?.leaderboardOptIn === false)
            continue;
        let totalScore = 0;
        let daysWithData = 0;
        let totalDeep = 0;
        // Track all stats for streak and improvement calculation
        const allStats = [];
        for (const date of twoWeekDates) {
            const statsSnap = await db.doc(`users/${uid}/dailyStats/${date}`).get();
            if (statsSnap.exists) {
                const data = statsSnap.data();
                allStats.push({ date, focusScore: data.focusScore || 0 });
                // Only count last 7 days for current week average
                if (dates.includes(date)) {
                    totalScore += data.focusScore || 0;
                    totalDeep += data.deepBlocks || 0;
                    daysWithData++;
                }
            }
        }
        if (daysWithData === 0)
            continue;
        // Calculate current streak (consecutive days with focusScore > 60)
        let currentStreak = 0;
        const sortedStats = [...allStats].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        for (const stat of sortedStats) {
            if (stat.focusScore > 60) {
                currentStreak++;
            }
            else {
                break;
            }
        }
        // Calculate improvement percentage (this week vs last week)
        let improvementPercent = null;
        const thisWeekStats = sortedStats.slice(0, 7);
        const lastWeekStats = sortedStats.slice(7, 14);
        if (thisWeekStats.length >= 3 && lastWeekStats.length >= 3) {
            const thisWeekAvg = thisWeekStats.reduce((s, d) => s + d.focusScore, 0) / thisWeekStats.length;
            const lastWeekAvg = lastWeekStats.reduce((s, d) => s + d.focusScore, 0) / lastWeekStats.length;
            if (lastWeekAvg > 0) {
                improvementPercent = Math.round(((thisWeekAvg - lastWeekAvg) / lastWeekAvg) * 100);
            }
        }
        scores.push({
            uid,
            nickname: generateNickname(uid),
            avgFocusScore: Math.round(totalScore / daysWithData),
            totalDeepBlocks: totalDeep,
            currentStreak,
            improvementPercent,
        });
    }
    // Sort by avgFocusScore descending
    scores.sort((a, b) => b.avgFocusScore - a.avgFocusScore);
    // Write to leaderboard collection
    const leaderboardRef = db.collection(`leaderboard/${weekId}/entries`);
    // Delete old entries for this week
    const oldEntries = await leaderboardRef.get();
    const deleteBatch = db.batch();
    oldEntries.docs.forEach(doc => deleteBatch.delete(doc.ref));
    if (!oldEntries.empty)
        await deleteBatch.commit();
    // Write new entries
    const writeBatch = db.batch();
    scores.forEach((entry, idx) => {
        const rank = idx + 1;
        const percentile = scores.length > 1
            ? Math.round(((scores.length - rank) / (scores.length - 1)) * 100)
            : 100;
        writeBatch.set(leaderboardRef.doc(entry.uid), {
            rank,
            anonymousNickname: entry.nickname,
            avgFocusScore: entry.avgFocusScore,
            deepWorkBlocks: entry.totalDeepBlocks,
            currentStreak: entry.currentStreak,
            improvementPercent: entry.improvementPercent,
            percentile,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
    });
    await writeBatch.commit();
    functions.logger.info(`computeLeaderboard: ranked ${scores.length} users for week ${weekId}`);
    return null;
});
//# sourceMappingURL=leaderboard.js.map