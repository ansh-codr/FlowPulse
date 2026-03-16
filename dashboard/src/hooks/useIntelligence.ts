/**
 * useIntelligence – Hook to access FlowPulse behavioral intelligence
 */
import { useMemo } from "react";
import { useDashboardData } from "./useDashboardData";
import {
  analyzeSessionIntelligence,
  analyzeDistractionPatterns,
  calculateFocusMetrics,
  generatePredictiveInsights,
  generateProductivityAdvice,
  calculateLeaderboardMetrics,
  type SessionMetrics,
  type DistractionPatterns,
  type FocusMetrics,
  type PredictiveInsights,
  type ProductivityAdvice,
  type LeaderboardMetrics,
} from "../../../shared/intelligence";
import type { CombinedAnalyticsDaily } from "../../../shared/types";

interface CombinedBehaviorSignals extends CombinedAnalyticsDaily {}

export interface IntelligenceData {
  sessionMetrics: SessionMetrics;
  distractionPatterns: DistractionPatterns;
  focusMetrics: FocusMetrics;
  predictiveInsights: PredictiveInsights;
  productivityAdvice: ProductivityAdvice;
  leaderboardMetrics: LeaderboardMetrics;
  combinedBehaviorSignals: CombinedBehaviorSignals;
  loading: boolean;
  hasEnoughData: boolean;
}

export function useIntelligence(): IntelligenceData {
  const { logs, weeklyStats, dailyStats, loading } = useDashboardData();

  const sessionMetrics = useMemo(
    () => analyzeSessionIntelligence(logs),
    [logs]
  );

  const distractionPatterns = useMemo(
    () => analyzeDistractionPatterns(logs),
    [logs]
  );

  const focusMetrics = useMemo(
    () => calculateFocusMetrics(logs, weeklyStats),
    [logs, weeklyStats]
  );

  const predictiveInsights = useMemo(
    () => generatePredictiveInsights(weeklyStats),
    [weeklyStats]
  );

  const productivityAdvice = useMemo(
    () =>
      generateProductivityAdvice(
        sessionMetrics,
        distractionPatterns,
        focusMetrics,
        predictiveInsights,
        dailyStats
      ),
    [sessionMetrics, distractionPatterns, focusMetrics, predictiveInsights, dailyStats]
  );

  const leaderboardMetrics = useMemo(
    () => calculateLeaderboardMetrics(weeklyStats, 50), // Default percentile, real value from leaderboard
    [weeklyStats]
  );

  const combinedBehaviorSignals = useMemo(
    () => ({
      date: dailyStats?.date ?? new Date().toISOString().slice(0, 10),
      desktopScreenTimeMinutes: dailyStats?.desktopScreenTimeMinutes ?? Math.round((dailyStats?.totalDuration ?? 0) / 60),
      learningActivityMinutes: dailyStats?.learningActivityMinutes ?? Math.round((dailyStats?.productiveTime ?? 0) / 60),
      dailyStepCount: dailyStats?.dailyStepCount ?? dailyStats?.mobileStepCount ?? 0,
      activeMovementMinutes: dailyStats?.activeMovementMinutes ?? dailyStats?.mobileActiveMinutes ?? 0,
      highScreenUsageLowPhysicalActivity: dailyStats?.highScreenUsageLowPhysicalActivity ?? false,
      healthyLearningMovementBalance: dailyStats?.healthyLearningMovementBalance ?? false,
      longSedentaryStudyPeriods: dailyStats?.longSedentaryStudyPeriods ?? 0,
      longSedentaryStudyDetected: dailyStats?.longSedentaryStudyDetected ?? false,
    }),
    [dailyStats]
  );

  const hasEnoughData = weeklyStats.length >= 14;

  return {
    sessionMetrics,
    distractionPatterns,
    focusMetrics,
    predictiveInsights,
    productivityAdvice,
    leaderboardMetrics,
    combinedBehaviorSignals,
    loading,
    hasEnoughData,
  };
}
