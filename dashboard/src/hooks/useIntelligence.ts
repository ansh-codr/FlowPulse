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

export interface IntelligenceData {
  sessionMetrics: SessionMetrics;
  distractionPatterns: DistractionPatterns;
  focusMetrics: FocusMetrics;
  predictiveInsights: PredictiveInsights;
  productivityAdvice: ProductivityAdvice;
  leaderboardMetrics: LeaderboardMetrics;
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

  const hasEnoughData = weeklyStats.length >= 14;

  return {
    sessionMetrics,
    distractionPatterns,
    focusMetrics,
    predictiveInsights,
    productivityAdvice,
    leaderboardMetrics,
    loading,
    hasEnoughData,
  };
}
