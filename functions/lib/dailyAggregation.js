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
// Social media domains for pattern detection
const SOCIAL_MEDIA_DOMAINS = [
    "facebook.com", "twitter.com", "x.com", "instagram.com", "tiktok.com",
    "reddit.com", "linkedin.com", "pinterest.com", "snapchat.com", "threads.net",
    "youtube.com", "twitch.tv", "discord.com"
];
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
    // Collect all stats writes, then commit in batches of 499
    const pendingWrites = [];
    for (const userDoc of usersSnap.docs) {
        const uid = userDoc.id;
        const logsSnap = await db
            .collection(`users/${uid}/activityLogs`)
            .where("startTime", ">=", admin.firestore.Timestamp.fromDate(startOfDay))
            .where("startTime", "<=", admin.firestore.Timestamp.fromDate(endOfDay))
            .get();
        if (logsSnap.empty)
            continue;
        let productiveTime = 0;
        let neutralTime = 0;
        let distractionTime = 0;
        let totalDuration = 0;
        const domainMap = new Map();
        let contextSwitches = 0;
        const hourBuckets = new Map();
        const logDocs = logsSnap.docs.map(d => d.data());
        // Sort logs chronologically for pattern detection
        const sortedLogs = [...logDocs].sort((a, b) => a.startTime.toMillis() - b.startTime.toMillis());
        // Count micro-distractions (rapid switches < 2 min)
        let microDistractions = 0;
        for (let i = 1; i < sortedLogs.length; i++) {
            const prevEnd = sortedLogs[i - 1].endTime?.toMillis() ?? sortedLogs[i - 1].startTime.toMillis() + sortedLogs[i - 1].duration * 1000;
            const currStart = sortedLogs[i].startTime.toMillis();
            const gap = (currStart - prevEnd) / 1000;
            if (sortedLogs[i].duration < 120 && // < 2 min duration
                gap < 5 && // < 5 sec gap
                sortedLogs[i].domain !== sortedLogs[i - 1].domain) {
                microDistractions++;
            }
        }
        // Detect rapid-switch bursts (4+ switches in 2 min window)
        let rapidSwitchBursts = 0;
        const windowMs = 2 * 60 * 1000;
        for (let i = 0; i < sortedLogs.length; i++) {
            const windowStart = sortedLogs[i].startTime.toMillis();
            const windowEnd = windowStart + windowMs;
            let switchCount = 0;
            let j = i + 1;
            while (j < sortedLogs.length && sortedLogs[j].startTime.toMillis() <= windowEnd) {
                if (sortedLogs[j].domain !== sortedLogs[j - 1].domain) {
                    switchCount++;
                }
                j++;
            }
            if (switchCount >= 4) {
                rapidSwitchBursts++;
                i = j - 1; // Skip ahead to avoid counting overlapping bursts
            }
        }
        // Detect social media loops (3+ visits to same social platform)
        const socialMediaVisits = new Map();
        for (const log of sortedLogs) {
            const platform = SOCIAL_MEDIA_DOMAINS.find(d => log.domain.includes(d));
            if (platform) {
                socialMediaVisits.set(platform, (socialMediaVisits.get(platform) ?? 0) + 1);
            }
        }
        const socialMediaLoops = [...socialMediaVisits.entries()]
            .filter(([, count]) => count >= 3)
            .map(([platform, count]) => ({ platform, visits: count }));
        // Detect dopamine cycles (productive → distraction < 5min → productive)
        let dopamineCycles = 0;
        for (let i = 0; i < sortedLogs.length - 2; i++) {
            if (sortedLogs[i].category === "productive" &&
                sortedLogs[i + 1].category === "distraction" &&
                sortedLogs[i + 1].duration < 300 &&
                sortedLogs[i + 2].category === "productive" &&
                SOCIAL_MEDIA_DOMAINS.some(d => sortedLogs[i + 1].domain.includes(d))) {
                dopamineCycles++;
            }
        }
        // Hourly distraction heatmap
        const hourlyDistractionMap = new Map();
        for (let h = 0; h < 24; h++) {
            hourlyDistractionMap.set(h, { distraction: 0, total: 0 });
        }
        for (let i = 0; i < logDocs.length; i++) {
            const log = logDocs[i];
            const dur = log.duration || 0;
            totalDuration += dur;
            const h = log.startTime.toMillis ? new Date(log.startTime.toMillis()).getHours() : 12;
            // Track hourly distraction data
            const hourlyData = hourlyDistractionMap.get(h);
            hourlyData.total += dur;
            switch (log.category) {
                case "productive":
                    productiveTime += dur;
                    break;
                case "distraction":
                    distractionTime += dur;
                    hourlyData.distraction += dur;
                    break;
                default:
                    neutralTime += dur;
            }
            const existing = domainMap.get(log.domain);
            if (existing) {
                existing.duration += dur;
            }
            else {
                domainMap.set(log.domain, {
                    domain: log.domain,
                    duration: dur,
                    category: log.category,
                });
            }
            hourBuckets.set(h, (hourBuckets.get(h) ?? 0) + dur);
            if (i > 0 && logDocs[i].domain !== logDocs[i - 1].domain)
                contextSwitches++;
        }
        // Build hourly distraction heatmap
        const distractionHeatmap = [...hourlyDistractionMap.entries()]
            .map(([hour, data]) => ({
            hour,
            distractionSeconds: data.distraction,
            ratio: data.total > 0 ? data.distraction / data.total : 0,
        }))
            .sort((a, b) => a.hour - b.hour);
        // Peak distraction hours (top 3)
        const peakDistractionHours = [...distractionHeatmap]
            .filter(h => h.distractionSeconds > 0)
            .sort((a, b) => b.ratio - a.ratio)
            .slice(0, 3)
            .map(h => h.hour);
        // Focus score: productive% weighted, penalise distractions
        const focusScore = totalDuration > 0
            ? Math.round(Math.min(100, Math.max(0, ((productiveTime / totalDuration) * 80) +
                (20 - (distractionTime / totalDuration) * 40))))
            : 0;
        // Count deep focus blocks (>25 min productive streaks)
        const deepBlocks = countDeepBlocks(logDocs);
        // Peak hour
        const peakHour = [...hourBuckets.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? 14;
        // Top 10 domains by time
        const topDomains = [...domainMap.values()]
            .sort((a, b) => b.duration - a.duration)
            .slice(0, 10);
        // Domain breakdown
        const domainBreakdown = {};
        for (const [domain, { duration: dur }] of domainMap) {
            domainBreakdown[domain] = dur;
        }
        const statsRef = db.doc(`users/${uid}/dailyStats/${dateStr}`);
        pendingWrites.push({
            ref: statsRef,
            data: {
                date: dateStr,
                focusScore,
                productiveTime,
                neutralTime,
                distractionTime,
                totalDuration,
                deepBlocks,
                topDomains,
                peakHour,
                contextSwitches,
                domainBreakdown,
                // Level 1: Session Intelligence
                microDistractions,
                // Level 2: Distraction Pattern Analysis
                rapidSwitchBursts,
                socialMediaLoops,
                dopamineCycles,
                distractionHeatmap,
                peakDistractionHours,
                updatedAt: new Date().toISOString(),
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
            },
        });
    }
    // Commit in batches of 499 to stay within Firestore's 500 limit
    const BATCH_LIMIT = 499;
    for (let i = 0; i < pendingWrites.length; i += BATCH_LIMIT) {
        const chunk = pendingWrites.slice(i, i + BATCH_LIMIT);
        const batch = db.batch();
        for (const { ref, data } of chunk) {
            batch.set(ref, data);
        }
        await batch.commit();
    }
    if (pendingWrites.length > 0) {
        functions.logger.info(`dailyAggregation: wrote ${pendingWrites.length} dailyStats for ${dateStr}`);
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
        currentStreak += log.duration;
        if (currentStreak >= 25 * 60) {
            blocks++;
            currentStreak = 0;
        }
    }
    return blocks;
}
//# sourceMappingURL=dailyAggregation.js.map