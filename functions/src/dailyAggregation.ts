import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

if (!admin.apps.length) admin.initializeApp();
const db = admin.firestore();

interface ActivityLog {
  domain: string;
  category: "productive" | "neutral" | "distraction";
  duration: number;  // seconds — matches extension field name
  startTime: admin.firestore.Timestamp;
}

interface DomainStat {
  domain: string;
  duration: number;  // seconds — matches shared DomainStat type
  category: "productive" | "neutral" | "distraction";
}

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

      for (let i = 0; i < logDocs.length; i++) {
        const log = logDocs[i];
        const dur = log.duration || 0;
        totalDuration += dur;

        switch (log.category) {
          case "productive":
            productiveTime += dur;
            break;
          case "distraction":
            distractionTime += dur;
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

        const h = log.startTime.toMillis ? new Date(log.startTime.toMillis()).getHours() : 12;
        hourBuckets.set(h, (hourBuckets.get(h) ?? 0) + dur);

        if (i > 0 && logDocs[i].domain !== logDocs[i - 1].domain) contextSwitches++;
      }

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
