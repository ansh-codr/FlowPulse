import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "./firebase";
import type {
  ActivityLog,
  DailyStats,
  UserSettings,
  Nudge,
  LeaderboardEntry,
} from "../../../shared/types";

/* ── Helpers ──────────────────────────────────────────────────────────────── */

function userRef(uid: string) {
  return doc(db, "users", uid);
}

function toDate(iso: string): Date {
  return new Date(iso);
}

/* ── Activity Logs ────────────────────────────────────────────────────────── */

export async function getActivityLogs(
  uid: string,
  dateStr: string // YYYY-MM-DD
): Promise<ActivityLog[]> {
  const start = new Date(`${dateStr}T00:00:00`);
  const end = new Date(`${dateStr}T23:59:59.999`);

  const logsRef = collection(db, "users", uid, "activityLogs");
  const q = query(
    logsRef,
    where("startTime", ">=", Timestamp.fromDate(start)),
    where("startTime", "<=", Timestamp.fromDate(end)),
    orderBy("startTime", "desc"),
    limit(500)
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      url: data.url,
      domain: data.domain,
      title: data.title,
      category: data.category,
      startTime: data.startTime?.toDate?.()?.toISOString?.() ?? data.startTime,
      endTime: data.endTime?.toDate?.()?.toISOString?.() ?? data.endTime,
      duration: data.duration,
    } as ActivityLog;
  });
}

export function subscribeToActivityLogs(
  uid: string,
  dateStr: string,
  callback: (logs: ActivityLog[]) => void
): Unsubscribe {
  const start = new Date(`${dateStr}T00:00:00`);
  const end = new Date(`${dateStr}T23:59:59.999`);

  const logsRef = collection(db, "users", uid, "activityLogs");
  const q = query(
    logsRef,
    where("startTime", ">=", Timestamp.fromDate(start)),
    where("startTime", "<=", Timestamp.fromDate(end)),
    orderBy("startTime", "desc"),
    limit(500)
  );

  return onSnapshot(q, (snapshot) => {
    const logs = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        url: data.url,
        domain: data.domain,
        title: data.title,
        category: data.category,
        startTime: data.startTime?.toDate?.()?.toISOString?.() ?? data.startTime,
        endTime: data.endTime?.toDate?.()?.toISOString?.() ?? data.endTime,
        duration: data.duration,
      } as ActivityLog;
    });
    callback(logs);
  });
}

/* ── Daily Stats ──────────────────────────────────────────────────────────── */

export async function getDailyStatsForDate(
  uid: string,
  dateStr: string
): Promise<DailyStats | null> {
  const ref = doc(db, "users", uid, "dailyStats", dateStr);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return snap.data() as DailyStats;
}

export async function getWeeklyStats(uid: string): Promise<DailyStats[]> {
  const statsRef = collection(db, "users", uid, "dailyStats");
  const q = query(statsRef, orderBy("date", "desc"), limit(7));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => doc.data() as DailyStats);
}

export function subscribeToDailyStats(
  uid: string,
  dateStr: string,
  callback: (stats: DailyStats | null) => void
): Unsubscribe {
  const ref = doc(db, "users", uid, "dailyStats", dateStr);
  return onSnapshot(ref, (snap) => {
    callback(snap.exists() ? (snap.data() as DailyStats) : null);
  });
}

/* ── Settings ─────────────────────────────────────────────────────────────── */

export async function getUserSettings(uid: string): Promise<UserSettings> {
  const ref = doc(db, "users", uid, "settings", "preferences");
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    // Return defaults
    return {
      trackingEnabled: true,
      blockedDomains: [],
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };
  }
  return snap.data() as UserSettings;
}

export async function updateUserSettings(
  uid: string,
  settings: Partial<UserSettings>
): Promise<void> {
  const ref = doc(db, "users", uid, "settings", "preferences");
  await setDoc(ref, settings, { merge: true });
}

/* ── Nudges ───────────────────────────────────────────────────────────────── */

export function subscribeToNudges(
  uid: string,
  callback: (nudges: Nudge[]) => void
): Unsubscribe {
  const nudgesRef = collection(db, "users", uid, "nudges");
  const q = query(
    nudgesRef,
    where("dismissed", "==", false),
    orderBy("timestamp", "desc"),
    limit(5)
  );

  return onSnapshot(q, (snapshot) => {
    const nudges = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Nudge[];
    callback(nudges);
  });
}

export async function dismissNudge(uid: string, nudgeId: string): Promise<void> {
  const ref = doc(db, "users", uid, "nudges", nudgeId);
  await updateDoc(ref, { dismissed: true });
}

/* ── Leaderboard ──────────────────────────────────────────────────────────── */

function getCurrentWeekId(): string {
  const now = new Date();
  const year = now.getFullYear();
  const start = new Date(year, 0, 1);
  const diff = now.getTime() - start.getTime();
  const week = Math.ceil(diff / (7 * 24 * 60 * 60 * 1000));
  return `${year}-W${String(week).padStart(2, "0")}`;
}

export async function getLeaderboard(
  weekId?: string
): Promise<LeaderboardEntry[]> {
  const wid = weekId ?? getCurrentWeekId();
  const entriesRef = collection(db, "leaderboard", wid, "entries");
  const q = query(entriesRef, orderBy("rank", "asc"), limit(50));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      rank: data.rank,
      anonymousNickname: data.anonymousNickname,
      avgFocusScore: data.avgFocusScore,
      deepWorkBlocks: data.deepWorkBlocks,
      percentile: data.percentile,
      userId: "", // Hidden from client
    } as LeaderboardEntry;
  });
}

/* ── Streak calculation ───────────────────────────────────────────────────── */

export async function getStreakDays(uid: string): Promise<number> {
  const statsRef = collection(db, "users", uid, "dailyStats");
  const q = query(statsRef, orderBy("date", "desc"), limit(30));
  const snapshot = await getDocs(q);

  if (snapshot.empty) return 0;

  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (const doc of snapshot.docs) {
    const data = doc.data() as DailyStats;
    const date = new Date(data.date);
    date.setHours(0, 0, 0, 0);

    const expected = new Date(today);
    expected.setDate(expected.getDate() - streak);

    if (date.getTime() === expected.getTime() && data.focusScore > 0) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}
