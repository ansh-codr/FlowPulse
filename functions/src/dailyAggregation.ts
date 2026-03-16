import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

if (!admin.apps.length) admin.initializeApp();
const db = admin.firestore();

interface ActivityLog {
  domain: string;
  category: "productive" | "neutral" | "distraction";
  duration: number;  // seconds — matches extension field name
  startTime: admin.firestore.Timestamp;
  endTime?: admin.firestore.Timestamp;
}

interface DomainStat {
  domain: string;
  duration: number;  // seconds — matches shared DomainStat type
  category: "productive" | "neutral" | "distraction";
}

interface MobileActivitySummary {
  step_count?: number;
  active_minutes?: number;
  activity_sessions?: number;
}

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
export const dailyAggregation = functions.pubsub
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
    const pendingWrites: Array<{ ref: FirebaseFirestore.DocumentReference; data: Record<string, unknown> }> = [];

    for (const userDoc of usersSnap.docs) {
      const uid = userDoc.id;
      const logsSnap = await db
        .collection(`users/${uid}/activityLogs`)
        .where("startTime", ">=", admin.firestore.Timestamp.fromDate(startOfDay))
        .where("startTime", "<=", admin.firestore.Timestamp.fromDate(endOfDay))
        .get();

      if (logsSnap.empty) continue;

      let productiveTime = 0;
      let neutralTime = 0;
      let distractionTime = 0;
      let totalDuration = 0;
      const domainMap = new Map<string, DomainStat>();
      let contextSwitches = 0;
      const hourBuckets = new Map<number, number>();

      const logDocs = logsSnap.docs.map(d => d.data() as ActivityLog);

      // Sort logs chronologically for pattern detection
      const sortedLogs = [...logDocs].sort(
        (a, b) => a.startTime.toMillis() - b.startTime.toMillis()
      );

      // Count micro-distractions (rapid switches < 2 min)
      let microDistractions = 0;
      for (let i = 1; i < sortedLogs.length; i++) {
        const prevEnd = sortedLogs[i - 1].endTime?.toMillis() ?? sortedLogs[i - 1].startTime.toMillis() + sortedLogs[i - 1].duration * 1000;
        const currStart = sortedLogs[i].startTime.toMillis();
        const gap = (currStart - prevEnd) / 1000;

        if (
          sortedLogs[i].duration < 120 && // < 2 min duration
          gap < 5 &&                       // < 5 sec gap
          sortedLogs[i].domain !== sortedLogs[i - 1].domain
        ) {
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
      const socialMediaVisits = new Map<string, number>();
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
        if (
          sortedLogs[i].category === "productive" &&
          sortedLogs[i + 1].category === "distraction" &&
          sortedLogs[i + 1].duration < 300 &&
          sortedLogs[i + 2].category === "productive" &&
          SOCIAL_MEDIA_DOMAINS.some(d => sortedLogs[i + 1].domain.includes(d))
        ) {
          dopamineCycles++;
        }
      }

      // Hourly distraction heatmap
      const hourlyDistractionMap = new Map<number, { distraction: number; total: number }>();
      for (let h = 0; h < 24; h++) {
        hourlyDistractionMap.set(h, { distraction: 0, total: 0 });
      }

      for (let i = 0; i < logDocs.length; i++) {
        const log = logDocs[i];
        const dur = log.duration || 0;
        totalDuration += dur;

        const h = log.startTime.toMillis ? new Date(log.startTime.toMillis()).getHours() : 12;
        
        // Track hourly distraction data
        const hourlyData = hourlyDistractionMap.get(h)!;
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
        } else {
          domainMap.set(log.domain, {
            domain: log.domain,
            duration: dur,
            category: log.category,
          });
        }

        hourBuckets.set(h, (hourBuckets.get(h) ?? 0) + dur);

        if (i > 0 && logDocs[i].domain !== logDocs[i - 1].domain) contextSwitches++;
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
        ? Math.round(
            Math.min(100, Math.max(0,
              ((productiveTime / totalDuration) * 80) +
              (20 - (distractionTime / totalDuration) * 40)
            ))
          )
        : 0;

      // Count deep focus blocks (>25 min productive streaks)
      const deepBlocks = countDeepBlocks(logDocs);

      // Peak hour
      const peakHour = [...hourBuckets.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? 14;

      // Top 10 domains by time
      const topDomains = [...domainMap.values()]
        .sort((a, b) => b.duration - a.duration)
        .slice(0, 10);

      // Mobile activity summary for correlation (privacy-safe aggregate fields only)
      const mobileSummarySnap = await db.doc(`users/${uid}/mobile_activity_summary/${dateStr}`).get();
      const mobileSummary = (mobileSummarySnap.data() as MobileActivitySummary | undefined) ?? {};
      const mobileStepCount = Math.max(0, Math.round(mobileSummary.step_count ?? 0));
      const mobileActiveMinutes = Math.max(0, Math.round(mobileSummary.active_minutes ?? 0));
      const mobileActivitySessions = Math.max(0, Math.round(mobileSummary.activity_sessions ?? 0));

      const desktopScreenTimeMinutes = Math.round(totalDuration / 60);
      const learningActivityMinutes = Math.round(productiveTime / 60);
      const dailyStepCount = mobileStepCount;
      const activeMovementMinutes = mobileActiveMinutes;

      const longSedentaryStudyPeriods = countLongSedentaryStudyPeriods(sortedLogs);

      // Cross-device behavior signals
      const highScreenTimeLowSteps = totalDuration >= 4 * 3600 && mobileStepCount > 0 && mobileStepCount < 3000;
      const longFocusWithoutMovement = deepBlocks >= 3 && mobileActiveMinutes < 20;
      const balancedLearningAndMovement =
        totalDuration >= 2 * 3600 &&
        productiveTime >= totalDuration * 0.5 &&
        mobileActiveMinutes >= 30 &&
        mobileStepCount >= 6000;

      const highScreenUsageLowPhysicalActivity =
        desktopScreenTimeMinutes >= 240 &&
        (dailyStepCount < 3000 || activeMovementMinutes < 20);
      const healthyLearningMovementBalance =
        learningActivityMinutes >= 120 &&
        activeMovementMinutes >= 30 &&
        dailyStepCount >= 6000;
      const longSedentaryStudyDetected = longSedentaryStudyPeriods > 0;

      const combinedAnalytics: CombinedAnalyticsDaily = {
        date: dateStr,
        desktopScreenTimeMinutes,
        learningActivityMinutes,
        dailyStepCount,
        activeMovementMinutes,
        highScreenUsageLowPhysicalActivity,
        healthyLearningMovementBalance,
        longSedentaryStudyPeriods,
        longSedentaryStudyDetected,
      };

      // Domain breakdown
      const domainBreakdown: Record<string, number> = {};
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
          mobileStepCount,
          mobileActiveMinutes,
          mobileActivitySessions,
          desktopScreenTimeMinutes,
          learningActivityMinutes,
          dailyStepCount,
          activeMovementMinutes,
          highScreenTimeLowSteps,
          longFocusWithoutMovement,
          balancedLearningAndMovement,
          highScreenUsageLowPhysicalActivity,
          healthyLearningMovementBalance,
          longSedentaryStudyPeriods,
          longSedentaryStudyDetected,
          updatedAt: new Date().toISOString(),
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        },
      });

      const combinedRef = db.doc(`users/${uid}/combined_analytics/${dateStr}`);
      pendingWrites.push({
        ref: combinedRef,
        data: {
          ...combinedAnalytics,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: new Date().toISOString(),
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
function countDeepBlocks(logs: ActivityLog[]): number {
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

/**
 * Count long sedentary study periods as productive streaks >= 90 minutes.
 */
function countLongSedentaryStudyPeriods(logs: ActivityLog[]): number {
  const productive = logs
    .filter((l) => l.category === "productive")
    .sort((a, b) => a.startTime.toMillis() - b.startTime.toMillis());

  if (productive.length === 0) return 0;

  let periods = 0;
  let streakSeconds = productive[0].duration;

  for (let i = 1; i < productive.length; i++) {
    const prev = productive[i - 1];
    const curr = productive[i];
    const prevEnd = prev.endTime?.toMillis() ?? prev.startTime.toMillis() + prev.duration * 1000;
    const currStart = curr.startTime.toMillis();
    const gapSeconds = (currStart - prevEnd) / 1000;

    if (gapSeconds <= 5 * 60) {
      streakSeconds += curr.duration;
    } else {
      if (streakSeconds >= 90 * 60) periods++;
      streakSeconds = curr.duration;
    }
  }

  if (streakSeconds >= 90 * 60) periods++;
  return periods;
}
