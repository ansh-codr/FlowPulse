/**
 * FlowPulse Intelligence Engine
 * Core algorithms for behavioral analysis, pattern detection, and predictive analytics
 */

import type { ActivityLog, DailyStats } from "./types";

/* ═══════════════════════════════════════════════════════════════════════════
 * LEVEL 1: SESSION INTELLIGENCE
 * ═══════════════════════════════════════════════════════════════════════════ */

export interface SessionMetrics {
  deepWorkSessions: number;      // Sessions >= 25 min continuous focus
  microDistractions: number;     // Rapid switches < 2 min
  contextSwitches: number;       // Domain changes
  avgFocusDuration: number;      // Average productive session length (minutes)
  idleTime: number;              // Seconds of idle/gap time
  sessionGroups: SessionGroup[];
}

export interface SessionGroup {
  id: string;
  start: string;
  end: string;
  totalDuration: number;         // seconds
  productiveDuration: number;
  distractionDuration: number;
  focusScore: number;
  type: "deep" | "flow" | "shallow" | "distracted";
  domains: string[];
}

/**
 * Analyze activity logs to extract session intelligence metrics
 */
export function analyzeSessionIntelligence(logs: ActivityLog[]): SessionMetrics {
  if (logs.length === 0) {
    return {
      deepWorkSessions: 0,
      microDistractions: 0,
      contextSwitches: 0,
      avgFocusDuration: 0,
      idleTime: 0,
      sessionGroups: [],
    };
  }

  const sorted = [...logs].sort(
    (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
  );

  // Count micro distractions (< 2 min rapid switches)
  let microDistractions = 0;
  for (let i = 1; i < sorted.length; i++) {
    const prevEnd = new Date(sorted[i - 1].endTime).getTime();
    const currStart = new Date(sorted[i].startTime).getTime();
    const gap = (currStart - prevEnd) / 1000;

    if (
      sorted[i].duration < 120 && // < 2 min duration
      gap < 5 &&                   // < 5 sec gap
      sorted[i].domain !== sorted[i - 1].domain
    ) {
      microDistractions++;
    }
  }

  // Count context switches
  let contextSwitches = 0;
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i].domain !== sorted[i - 1].domain) {
      contextSwitches++;
    }
  }

  // Calculate idle time (gaps between sessions > 1 min)
  let idleTime = 0;
  for (let i = 1; i < sorted.length; i++) {
    const prevEnd = new Date(sorted[i - 1].endTime).getTime();
    const currStart = new Date(sorted[i].startTime).getTime();
    const gap = (currStart - prevEnd) / 1000;
    if (gap > 60) {
      idleTime += gap;
    }
  }

  // Group sessions (5 min gap threshold)
  const sessionGroups = groupSessions(sorted, 5 * 60 * 1000);

  // Count deep work sessions (>= 25 min continuous productive time)
  const deepWorkSessions = sessionGroups.filter(
    (g) => g.type === "deep" && g.productiveDuration >= 25 * 60
  ).length;

  // Average productive session duration
  const productiveSessions = sessionGroups.filter((g) => g.productiveDuration > 0);
  const avgFocusDuration =
    productiveSessions.length > 0
      ? Math.round(
          productiveSessions.reduce((s, g) => s + g.productiveDuration, 0) /
            productiveSessions.length /
            60
        )
      : 0;

  return {
    deepWorkSessions,
    microDistractions,
    contextSwitches,
    avgFocusDuration,
    idleTime,
    sessionGroups,
  };
}

/**
 * Group contiguous activity logs into sessions
 */
function groupSessions(logs: ActivityLog[], gapThreshold: number): SessionGroup[] {
  if (logs.length === 0) return [];

  const groups: SessionGroup[] = [];
  let currentGroup: ActivityLog[] = [logs[0]];

  for (let i = 1; i < logs.length; i++) {
    const prevEnd = new Date(logs[i - 1].endTime).getTime();
    const currStart = new Date(logs[i].startTime).getTime();
    const gap = currStart - prevEnd;

    if (gap <= gapThreshold) {
      currentGroup.push(logs[i]);
    } else {
      groups.push(createSessionGroup(currentGroup, groups.length));
      currentGroup = [logs[i]];
    }
  }

  // Flush last group
  if (currentGroup.length > 0) {
    groups.push(createSessionGroup(currentGroup, groups.length));
  }

  return groups;
}

function createSessionGroup(logs: ActivityLog[], index: number): SessionGroup {
  const totalDuration = logs.reduce((s, l) => s + l.duration, 0);
  const productiveDuration = logs
    .filter((l) => l.category === "productive")
    .reduce((s, l) => s + l.duration, 0);
  const distractionDuration = logs
    .filter((l) => l.category === "distraction")
    .reduce((s, l) => s + l.duration, 0);

  const focusScore =
    totalDuration > 0
      ? Math.round(
          Math.min(
            100,
            Math.max(
              0,
              (productiveDuration / totalDuration) * 80 +
                (20 - (distractionDuration / totalDuration) * 40)
            )
          )
        )
      : 0;

  const type: SessionGroup["type"] =
    focusScore >= 80 ? "deep" : focusScore >= 65 ? "flow" : focusScore >= 45 ? "shallow" : "distracted";

  const domains = [...new Set(logs.map((l) => l.domain))];

  return {
    id: `sg-${index}`,
    start: logs[0].startTime,
    end: logs[logs.length - 1].endTime,
    totalDuration,
    productiveDuration,
    distractionDuration,
    focusScore,
    type,
    domains,
  };
}

/* ═══════════════════════════════════════════════════════════════════════════
 * LEVEL 2: DISTRACTION PATTERN ANALYSIS
 * ═══════════════════════════════════════════════════════════════════════════ */

export interface DistractionPatterns {
  peakDistractionHours: number[];           // Hours (0-23) with highest distraction
  mostFrequentDistraction: string;          // Most visited distraction domain
  avgDistractionDuration: number;           // Average distraction session (seconds)
  rapidSwitchBursts: RapidSwitchBurst[];    // Detected rapid-switch bursts
  socialMediaLoops: SocialMediaLoop[];      // Social media loop patterns
  dopamineCycles: DopamineCycle[];          // Short dopamine-seeking cycles
  distractionHeatmap: HourlyDistraction[];  // Hour-by-hour distraction data
}

export interface RapidSwitchBurst {
  start: string;
  end: string;
  switchCount: number;
  domains: string[];
}

export interface SocialMediaLoop {
  platform: string;
  visitCount: number;
  totalDuration: number;
  avgSessionDuration: number;
}

export interface DopamineCycle {
  timestamp: string;
  pattern: string;   // e.g., "work → social → work"
  duration: number;
}

export interface HourlyDistraction {
  hour: number;
  distractionSeconds: number;
  distractionCount: number;
  ratio: number;  // 0-1
}

const SOCIAL_MEDIA_DOMAINS = [
  "facebook.com", "twitter.com", "x.com", "instagram.com", "tiktok.com",
  "reddit.com", "linkedin.com", "pinterest.com", "snapchat.com", "threads.net",
  "youtube.com", "twitch.tv", "discord.com"
];

/**
 * Analyze distraction patterns from activity logs
 */
export function analyzeDistractionPatterns(logs: ActivityLog[]): DistractionPatterns {
  const sorted = [...logs].sort(
    (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
  );

  // Build hourly distraction map
  const hourlyMap = new Map<number, { distraction: number; total: number; count: number }>();
  for (let h = 0; h < 24; h++) {
    hourlyMap.set(h, { distraction: 0, total: 0, count: 0 });
  }

  const distractionDomains = new Map<string, number>();
  const distractionDurations: number[] = [];

  for (const log of sorted) {
    const hour = new Date(log.startTime).getHours();
    const bucket = hourlyMap.get(hour)!;
    bucket.total += log.duration;

    if (log.category === "distraction") {
      bucket.distraction += log.duration;
      bucket.count++;
      distractionDurations.push(log.duration);
      distractionDomains.set(
        log.domain,
        (distractionDomains.get(log.domain) ?? 0) + log.duration
      );
    }
  }

  // Peak distraction hours (top 3 by distraction ratio)
  const distractionHeatmap: HourlyDistraction[] = [...hourlyMap.entries()]
    .map(([hour, data]) => ({
      hour,
      distractionSeconds: data.distraction,
      distractionCount: data.count,
      ratio: data.total > 0 ? data.distraction / data.total : 0,
    }))
    .sort((a, b) => a.hour - b.hour);

  const peakDistractionHours = [...distractionHeatmap]
    .filter((h) => h.distractionSeconds > 0)
    .sort((a, b) => b.ratio - a.ratio)
    .slice(0, 3)
    .map((h) => h.hour);

  // Most frequent distraction
  const mostFrequentDistraction =
    [...distractionDomains.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";

  // Average distraction duration
  const avgDistractionDuration =
    distractionDurations.length > 0
      ? Math.round(
          distractionDurations.reduce((s, d) => s + d, 0) / distractionDurations.length
        )
      : 0;

  // Detect rapid-switch bursts (4+ switches in 2 min window)
  const rapidSwitchBursts = detectRapidSwitchBursts(sorted);

  // Detect social media loops
  const socialMediaLoops = detectSocialMediaLoops(sorted);

  // Detect dopamine cycles
  const dopamineCycles = detectDopamineCycles(sorted);

  return {
    peakDistractionHours,
    mostFrequentDistraction,
    avgDistractionDuration,
    rapidSwitchBursts,
    socialMediaLoops,
    dopamineCycles,
    distractionHeatmap,
  };
}

function detectRapidSwitchBursts(logs: ActivityLog[]): RapidSwitchBurst[] {
  const bursts: RapidSwitchBurst[] = [];
  const windowMs = 2 * 60 * 1000; // 2 minutes
  const minSwitches = 4;

  for (let i = 0; i < logs.length; i++) {
    const windowStart = new Date(logs[i].startTime).getTime();
    const windowEnd = windowStart + windowMs;

    const windowLogs: ActivityLog[] = [];
    for (let j = i; j < logs.length; j++) {
      const logStart = new Date(logs[j].startTime).getTime();
      if (logStart <= windowEnd) {
        windowLogs.push(logs[j]);
      } else {
        break;
      }
    }

    // Count domain switches in window
    let switches = 0;
    const domains = new Set<string>();
    for (let k = 1; k < windowLogs.length; k++) {
      if (windowLogs[k].domain !== windowLogs[k - 1].domain) {
        switches++;
        domains.add(windowLogs[k - 1].domain);
        domains.add(windowLogs[k].domain);
      }
    }

    if (switches >= minSwitches) {
      const lastLog = windowLogs[windowLogs.length - 1];
      bursts.push({
        start: logs[i].startTime,
        end: lastLog.endTime,
        switchCount: switches,
        domains: [...domains],
      });
      // Skip ahead to avoid overlapping bursts
      i += windowLogs.length - 1;
    }
  }

  return bursts;
}

function detectSocialMediaLoops(logs: ActivityLog[]): SocialMediaLoop[] {
  const platformStats = new Map<string, { visits: number; duration: number }>();

  for (const log of logs) {
    const platform = SOCIAL_MEDIA_DOMAINS.find((d) => log.domain.includes(d));
    if (platform) {
      const existing = platformStats.get(platform) ?? { visits: 0, duration: 0 };
      existing.visits++;
      existing.duration += log.duration;
      platformStats.set(platform, existing);
    }
  }

  return [...platformStats.entries()]
    .filter(([, stats]) => stats.visits >= 3) // 3+ visits = potential loop
    .map(([platform, stats]) => ({
      platform,
      visitCount: stats.visits,
      totalDuration: stats.duration,
      avgSessionDuration: Math.round(stats.duration / stats.visits),
    }))
    .sort((a, b) => b.visitCount - a.visitCount);
}

function detectDopamineCycles(logs: ActivityLog[]): DopamineCycle[] {
  const cycles: DopamineCycle[] = [];

  // Look for pattern: productive → distraction (< 5 min) → productive
  for (let i = 0; i < logs.length - 2; i++) {
    if (
      logs[i].category === "productive" &&
      logs[i + 1].category === "distraction" &&
      logs[i + 1].duration < 300 && // < 5 min distraction
      logs[i + 2].category === "productive"
    ) {
      const distDomain = logs[i + 1].domain;
      if (SOCIAL_MEDIA_DOMAINS.some((d) => distDomain.includes(d))) {
        cycles.push({
          timestamp: logs[i + 1].startTime,
          pattern: `work → ${distDomain} → work`,
          duration: logs[i + 1].duration,
        });
      }
    }
  }

  return cycles;
}

/* ═══════════════════════════════════════════════════════════════════════════
 * LEVEL 3: FOCUS SCORE ENGINE (Extended)
 * ═══════════════════════════════════════════════════════════════════════════ */

export interface FocusMetrics {
  dailyScore: number;
  weeklyTrend: "improving" | "declining" | "stable";
  consistencyRating: number;  // 0-100 based on score variance
  contextSwitchPenalty: number;
  distractionPenalty: number;
  deepWorkBonus: number;
}

/**
 * Calculate enhanced focus metrics with consistency rating
 */
export function calculateFocusMetrics(
  logs: ActivityLog[],
  weeklyStats: DailyStats[]
): FocusMetrics {
  const sessionMetrics = analyzeSessionIntelligence(logs);

  // Base score calculation
  const totalDuration = logs.reduce((s, l) => s + l.duration, 0);
  const productiveDuration = logs
    .filter((l) => l.category === "productive")
    .reduce((s, l) => s + l.duration, 0);
  const distractionDuration = logs
    .filter((l) => l.category === "distraction")
    .reduce((s, l) => s + l.duration, 0);

  // Penalties and bonuses
  const contextSwitchPenalty = Math.min(20, sessionMetrics.contextSwitches * 0.5);
  const distractionPenalty =
    totalDuration > 0 ? (distractionDuration / totalDuration) * 40 : 0;
  const deepWorkBonus = sessionMetrics.deepWorkSessions * 5;

  const rawScore =
    totalDuration > 0
      ? (productiveDuration / totalDuration) * 80 +
        20 -
        distractionPenalty -
        contextSwitchPenalty +
        deepWorkBonus
      : 0;

  const dailyScore = Math.round(Math.min(100, Math.max(0, rawScore)));

  // Weekly trend
  let weeklyTrend: FocusMetrics["weeklyTrend"] = "stable";
  if (weeklyStats.length >= 3) {
    const recent = weeklyStats.slice(0, 3);
    const older = weeklyStats.slice(-3);
    const recentAvg = recent.reduce((s, d) => s + d.focusScore, 0) / recent.length;
    const olderAvg = older.reduce((s, d) => s + d.focusScore, 0) / older.length;

    if (recentAvg > olderAvg + 5) weeklyTrend = "improving";
    else if (recentAvg < olderAvg - 5) weeklyTrend = "declining";
  }

  // Consistency rating (inverse of variance)
  let consistencyRating = 100;
  if (weeklyStats.length >= 3) {
    const scores = weeklyStats.map((s) => s.focusScore);
    const mean = scores.reduce((s, v) => s + v, 0) / scores.length;
    const variance =
      scores.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / scores.length;
    const stdDev = Math.sqrt(variance);
    consistencyRating = Math.round(Math.max(0, Math.min(100, 100 - stdDev * 2)));
  }

  return {
    dailyScore,
    weeklyTrend,
    consistencyRating,
    contextSwitchPenalty: Math.round(contextSwitchPenalty),
    distractionPenalty: Math.round(distractionPenalty),
    deepWorkBonus: Math.round(deepWorkBonus),
  };
}

/* ═══════════════════════════════════════════════════════════════════════════
 * LEVEL 4: PREDICTIVE ANALYTICS
 * ═══════════════════════════════════════════════════════════════════════════ */

export interface PredictiveInsights {
  predictedFocusScore: number | null;       // Predicted score for today
  optimalFocusHours: number[];              // Best hours for deep work
  lowFocusDayRisk: "low" | "medium" | "high";
  burnoutRisk: "low" | "medium" | "high";
  optimalBreakTimes: number[];              // Suggested break hours
  weekdayPatterns: WeekdayPattern[];
}

export interface WeekdayPattern {
  dayOfWeek: number;  // 0-6 (Sun-Sat)
  avgFocusScore: number;
  avgProductiveTime: number;
  commonPeakHour: number;
}

/**
 * Generate predictive insights from historical data
 * Requires minimum 2 weeks of data for accuracy
 */
export function generatePredictiveInsights(
  weeklyStats: DailyStats[],
  currentHour: number = new Date().getHours()
): PredictiveInsights {
  const hasEnoughData = weeklyStats.length >= 14;

  // Default values when insufficient data
  if (!hasEnoughData) {
    return {
      predictedFocusScore: null,
      optimalFocusHours: [9, 10, 11, 14, 15, 16],
      lowFocusDayRisk: "low",
      burnoutRisk: "low",
      optimalBreakTimes: [12, 15, 18],
      weekdayPatterns: [],
    };
  }

  // Analyze weekday patterns
  const weekdayBuckets = new Map<number, DailyStats[]>();
  for (const stat of weeklyStats) {
    const dayOfWeek = new Date(stat.date).getDay();
    const bucket = weekdayBuckets.get(dayOfWeek) ?? [];
    bucket.push(stat);
    weekdayBuckets.set(dayOfWeek, bucket);
  }

  const weekdayPatterns: WeekdayPattern[] = [...weekdayBuckets.entries()]
    .map(([dayOfWeek, stats]) => ({
      dayOfWeek,
      avgFocusScore: Math.round(
        stats.reduce((s, d) => s + d.focusScore, 0) / stats.length
      ),
      avgProductiveTime: Math.round(
        stats.reduce((s, d) => s + d.productiveTime, 0) / stats.length
      ),
      commonPeakHour: stats[0]?.peakHour ?? 14,
    }))
    .sort((a, b) => a.dayOfWeek - b.dayOfWeek);

  // Predict today's focus score based on same day of week
  const todayDayOfWeek = new Date().getDay();
  const todayPattern = weekdayPatterns.find((p) => p.dayOfWeek === todayDayOfWeek);
  const predictedFocusScore = todayPattern?.avgFocusScore ?? null;

  // Find optimal focus hours from peak hour distribution
  const peakHours = weeklyStats.map((s) => s.peakHour);
  const hourCounts = new Map<number, number>();
  for (const h of peakHours) {
    hourCounts.set(h, (hourCounts.get(h) ?? 0) + 1);
  }
  const optimalFocusHours = [...hourCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([h]) => h)
    .sort((a, b) => a - b);

  // Low focus day risk (based on weekday pattern)
  const lowFocusDayRisk: PredictiveInsights["lowFocusDayRisk"] =
    (todayPattern?.avgFocusScore ?? 70) < 50 ? "high" :
    (todayPattern?.avgFocusScore ?? 70) < 65 ? "medium" : "low";

  // Burnout risk (high activity + declining scores)
  const recentStats = weeklyStats.slice(0, 7);
  const avgDailyTime = recentStats.reduce((s, d) => s + d.totalDuration, 0) / recentStats.length;
  const avgFocusScore = recentStats.reduce((s, d) => s + d.focusScore, 0) / recentStats.length;
  const burnoutRisk: PredictiveInsights["burnoutRisk"] =
    avgDailyTime > 8 * 3600 && avgFocusScore < 60 ? "high" :
    avgDailyTime > 6 * 3600 && avgFocusScore < 70 ? "medium" : "low";

  // Optimal break times (every 90 min from peak hour start)
  const primaryPeak = optimalFocusHours[0] ?? 10;
  const optimalBreakTimes = [
    primaryPeak + 1.5,
    primaryPeak + 3,
    primaryPeak + 4.5,
  ].map(Math.round).filter((h) => h < 20 && h > 8);

  return {
    predictedFocusScore,
    optimalFocusHours,
    lowFocusDayRisk,
    burnoutRisk,
    optimalBreakTimes,
    weekdayPatterns,
  };
}

/* ═══════════════════════════════════════════════════════════════════════════
 * LEVEL 5: AI STUDY ADVISOR
 * ═══════════════════════════════════════════════════════════════════════════ */

export interface ProductivityAdvice {
  dailySummary: string;
  focusImprovements: string[];
  distractionReduction: string[];
  bestStudyTime: string;
  lifestyleInsight: string | null;
  priorityRecommendation: {
    priority: "high" | "medium" | "low";
    action: string;
  };
}

/**
 * Generate personalized productivity advice
 * Constraints: No medical claims, no mental health diagnosis
 */
export function generateProductivityAdvice(
  sessionMetrics: SessionMetrics,
  distractionPatterns: DistractionPatterns,
  focusMetrics: FocusMetrics,
  predictiveInsights: PredictiveInsights
): ProductivityAdvice {
  const focusImprovements: string[] = [];
  const distractionReduction: string[] = [];

  // Daily summary
  let dailySummary: string;
  if (focusMetrics.dailyScore >= 80) {
    dailySummary = `Excellent focus day! You achieved ${sessionMetrics.deepWorkSessions} deep work sessions with an average focus duration of ${sessionMetrics.avgFocusDuration} minutes.`;
  } else if (focusMetrics.dailyScore >= 60) {
    dailySummary = `Solid productivity today. Your focus score of ${focusMetrics.dailyScore} shows room for improvement, especially in reducing context switches (${sessionMetrics.contextSwitches} today).`;
  } else {
    dailySummary = `Challenging focus day with ${sessionMetrics.microDistractions} micro-distractions detected. Consider protecting focused time blocks tomorrow.`;
  }

  // Focus improvements
  if (sessionMetrics.contextSwitches > 20) {
    focusImprovements.push(
      "High context switching detected. Try batching similar tasks together."
    );
  }
  if (sessionMetrics.deepWorkSessions < 2) {
    focusImprovements.push(
      "Aim for at least 2 deep work sessions (25+ min each) per day."
    );
  }
  if (sessionMetrics.avgFocusDuration < 15) {
    focusImprovements.push(
      "Your average session is short. Try the Pomodoro technique: 25 min focus, 5 min break."
    );
  }
  if (focusMetrics.weeklyTrend === "declining") {
    focusImprovements.push(
      "Your focus has been declining. Consider reviewing what changed recently."
    );
  }

  // Distraction reduction
  if (distractionPatterns.rapidSwitchBursts.length > 0) {
    distractionReduction.push(
      `${distractionPatterns.rapidSwitchBursts.length} rapid-switch burst(s) detected. These scatter your attention significantly.`
    );
  }
  if (distractionPatterns.socialMediaLoops.length > 0) {
    const topLoop = distractionPatterns.socialMediaLoops[0];
    distractionReduction.push(
      `You visited ${topLoop.platform} ${topLoop.visitCount} times today. Consider using a site blocker during work hours.`
    );
  }
  if (distractionPatterns.dopamineCycles.length > 3) {
    distractionReduction.push(
      "Multiple dopamine-seeking cycles detected (quick social media checks mid-work). Batch your social media time instead."
    );
  }
  if (distractionPatterns.peakDistractionHours.length > 0) {
    const peakHour = distractionPatterns.peakDistractionHours[0];
    const timeStr = `${peakHour}:00-${peakHour + 1}:00`;
    distractionReduction.push(
      `Your peak distraction hour is ${timeStr}. Protect this time or schedule breaks then.`
    );
  }

  // Best study time
  const bestHours = predictiveInsights.optimalFocusHours;
  let bestStudyTime = "Based on your patterns, ";
  if (bestHours.length > 0) {
    const formatted = bestHours.slice(0, 2).map((h) => `${h}:00`).join(" and ");
    bestStudyTime += `your optimal focus hours are around ${formatted}. Schedule your most important work then.`;
  } else {
    bestStudyTime += "mornings (9-11 AM) are generally best for deep focus work.";
  }

  // Lifestyle insight (behavior-based only)
  let lifestyleInsight: string | null = null;
  if (predictiveInsights.burnoutRisk === "high") {
    lifestyleInsight =
      "Your screen time has been high with declining focus. Consider taking tomorrow off or doing a light day.";
  }

  // Priority recommendation
  let priorityRecommendation: ProductivityAdvice["priorityRecommendation"];
  if (focusMetrics.dailyScore < 50) {
    priorityRecommendation = {
      priority: "high",
      action: "Block your top distraction site for 2 hours during your peak focus time tomorrow.",
    };
  } else if (distractionPatterns.rapidSwitchBursts.length > 2) {
    priorityRecommendation = {
      priority: "medium",
      action: "Practice single-tasking: work on one thing for 25 minutes before switching.",
    };
  } else {
    priorityRecommendation = {
      priority: "low",
      action: "Maintain your current rhythm and aim for one extra deep work session.",
    };
  }

  return {
    dailySummary,
    focusImprovements,
    distractionReduction,
    bestStudyTime,
    lifestyleInsight,
    priorityRecommendation,
  };
}

/* ═══════════════════════════════════════════════════════════════════════════
 * LEVEL 7: LEADERBOARD EVOLUTION (Extended)
 * ═══════════════════════════════════════════════════════════════════════════ */

export interface LeaderboardMetrics {
  weeklyPercentile: number;
  improvementPercent: number | null;  // vs. previous week
  currentStreak: number;              // Days with score > 60
  longestStreak: number;
}

/**
 * Calculate leaderboard evolution metrics
 */
export function calculateLeaderboardMetrics(
  weeklyStats: DailyStats[],
  currentPercentile: number
): LeaderboardMetrics {
  // Current streak (consecutive days with focusScore > 60)
  let currentStreak = 0;
  const sorted = [...weeklyStats].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  for (const stat of sorted) {
    if (stat.focusScore > 60) {
      currentStreak++;
    } else {
      break;
    }
  }

  // Longest streak
  let longestStreak = 0;
  let tempStreak = 0;
  for (const stat of sorted) {
    if (stat.focusScore > 60) {
      tempStreak++;
      longestStreak = Math.max(longestStreak, tempStreak);
    } else {
      tempStreak = 0;
    }
  }

  // Improvement percentage (this week vs last week)
  let improvementPercent: number | null = null;
  if (weeklyStats.length >= 14) {
    const thisWeek = weeklyStats.slice(0, 7);
    const lastWeek = weeklyStats.slice(7, 14);
    const thisWeekAvg =
      thisWeek.reduce((s, d) => s + d.focusScore, 0) / thisWeek.length;
    const lastWeekAvg =
      lastWeek.reduce((s, d) => s + d.focusScore, 0) / lastWeek.length;
    if (lastWeekAvg > 0) {
      improvementPercent = Math.round(
        ((thisWeekAvg - lastWeekAvg) / lastWeekAvg) * 100
      );
    }
  }

  return {
    weeklyPercentile: currentPercentile,
    improvementPercent,
    currentStreak,
    longestStreak,
  };
}
