/**
 * InsightsPage – AI-powered productivity insights and recommendations
 */
import { motion } from "framer-motion";
import { GlassCard } from "../components/GlassCard";
import { useIntelligence } from "../hooks/useIntelligence";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

const priorityColors = {
  high: { bg: "bg-rose-500/15", text: "text-rose-300", border: "border-rose-500/30" },
  medium: { bg: "bg-amber-500/15", text: "text-amber-300", border: "border-amber-500/30" },
  low: { bg: "bg-emerald-500/15", text: "text-emerald-300", border: "border-emerald-500/30" },
};

const riskColors = {
  high: "#f97373",
  medium: "#fbbf24",
  low: "#4ade80",
};

export function InsightsPage() {
  const {
    sessionMetrics,
    distractionPatterns,
    focusMetrics,
    predictiveInsights,
    productivityAdvice,
    leaderboardMetrics,
    loading,
    hasEnoughData,
  } = useIntelligence();

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative h-12 w-12">
            <div className="absolute inset-0 rounded-full border-2 border-neon/20" />
            <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-neon" />
          </div>
          <p className="text-xs uppercase tracking-[0.4em] text-white/30">Analyzing patterns…</p>
        </div>
      </div>
    );
  }

  const priorityStyle = priorityColors[productivityAdvice.priorityRecommendation.priority];

  return (
    <motion.div className="space-y-6" variants={container} initial="hidden" animate="show">
      {/* Header */}
      <motion.div variants={item} className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-1.5 w-1.5 animate-pulse-glow rounded-full bg-aurora shadow-glow-aurora" />
          <p className="text-xs uppercase tracking-[0.4em] text-white/30">AI Analysis</p>
        </div>
        <h1 className="font-display text-4xl font-bold tracking-tight text-white">
          Productivity Insights
        </h1>
        <p className="text-sm text-white/40">
          Behavioral intelligence powered by your activity patterns
        </p>
      </motion.div>

      {/* Priority Action Card */}
      <motion.div variants={item}>
        <div className={`rounded-2xl border ${priorityStyle.border} ${priorityStyle.bg} p-6`}>
          <div className="flex items-start gap-4">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${priorityStyle.bg} ${priorityStyle.text}`}>
              {productivityAdvice.priorityRecommendation.priority === "high" ? "⚡" : 
               productivityAdvice.priorityRecommendation.priority === "medium" ? "📌" : "✓"}
            </div>
            <div className="flex-1">
              <p className={`text-xs uppercase tracking-wider ${priorityStyle.text}`}>
                {productivityAdvice.priorityRecommendation.priority} priority action
              </p>
              <p className="mt-1 text-lg font-semibold text-white">
                {productivityAdvice.priorityRecommendation.action}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Daily Summary */}
      <motion.div variants={item}>
        <GlassCard title="Today's Summary" subtitle="AI-generated analysis" accentColor="#58f0ff">
          <p className="text-sm leading-relaxed text-white/70">
            {productivityAdvice.dailySummary}
          </p>
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-xl bg-white/[0.04] p-3 text-center">
              <p className="font-display text-2xl font-bold text-neon">{sessionMetrics.deepWorkSessions}</p>
              <p className="text-[10px] uppercase tracking-wider text-white/40">Deep Sessions</p>
            </div>
            <div className="rounded-xl bg-white/[0.04] p-3 text-center">
              <p className="font-display text-2xl font-bold text-aurora">{sessionMetrics.avgFocusDuration}m</p>
              <p className="text-[10px] uppercase tracking-wider text-white/40">Avg Focus</p>
            </div>
            <div className="rounded-xl bg-white/[0.04] p-3 text-center">
              <p className="font-display text-2xl font-bold text-amber-400">{sessionMetrics.contextSwitches}</p>
              <p className="text-[10px] uppercase tracking-wider text-white/40">Switches</p>
            </div>
            <div className="rounded-xl bg-white/[0.04] p-3 text-center">
              <p className="font-display text-2xl font-bold text-rose-400">{sessionMetrics.microDistractions}</p>
              <p className="text-[10px] uppercase tracking-wider text-white/40">Micro Distracts</p>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Focus Score Breakdown */}
      <motion.div variants={item} className="grid gap-6 lg:grid-cols-2">
        <GlassCard title="Focus Score Breakdown" subtitle="Score composition" accentColor="#9c6bff" delay={0.05}>
          <div className="space-y-4">
            <div className="flex items-end gap-4">
              <span className="font-display text-5xl font-bold text-neon">{focusMetrics.dailyScore}</span>
              <span className="mb-2 text-sm text-white/40">/ 100</span>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/60">Base productive ratio</span>
                <span className="font-medium text-white">+80 max</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/60">Distraction penalty</span>
                <span className="font-medium text-rose-400">-{focusMetrics.distractionPenalty}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/60">Context switch penalty</span>
                <span className="font-medium text-amber-400">-{focusMetrics.contextSwitchPenalty}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/60">Deep work bonus</span>
                <span className="font-medium text-emerald-400">+{focusMetrics.deepWorkBonus}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-xl bg-white/[0.04] p-3">
              <span className="text-sm text-white/60">Weekly trend:</span>
              <span className={`rounded-full px-2 py-0.5 text-xs font-medium uppercase ${
                focusMetrics.weeklyTrend === "improving" ? "bg-emerald-500/20 text-emerald-300" :
                focusMetrics.weeklyTrend === "declining" ? "bg-rose-500/20 text-rose-300" :
                "bg-white/10 text-white/50"
              }`}>
                {focusMetrics.weeklyTrend}
              </span>
              <span className="text-sm text-white/60">Consistency:</span>
              <span className="font-medium text-neon">{focusMetrics.consistencyRating}%</span>
            </div>
          </div>
        </GlassCard>

        {/* Predictive Insights */}
        <GlassCard title="Predictive Insights" subtitle={hasEnoughData ? "Based on 2+ weeks data" : "Building patterns..."} accentColor="#f5c842" delay={0.1}>
          {!hasEnoughData ? (
            <div className="flex flex-col items-center gap-3 py-8">
              <div className="h-16 w-16 rounded-full border-2 border-dashed border-amber-500/30 flex items-center justify-center">
                <span className="text-2xl">📊</span>
              </div>
              <p className="text-center text-sm text-white/40">
                Keep tracking for 2 weeks to unlock predictive analytics
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {predictiveInsights.predictedFocusScore && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/60">Predicted score today</span>
                  <span className="font-display text-xl font-bold text-amber-400">
                    ~{predictiveInsights.predictedFocusScore}
                  </span>
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-white/60">Low focus risk</span>
                <span className="rounded-full px-2 py-0.5 text-xs font-medium" style={{
                  backgroundColor: `${riskColors[predictiveInsights.lowFocusDayRisk]}20`,
                  color: riskColors[predictiveInsights.lowFocusDayRisk]
                }}>
                  {predictiveInsights.lowFocusDayRisk}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-white/60">Burnout risk</span>
                <span className="rounded-full px-2 py-0.5 text-xs font-medium" style={{
                  backgroundColor: `${riskColors[predictiveInsights.burnoutRisk]}20`,
                  color: riskColors[predictiveInsights.burnoutRisk]
                }}>
                  {predictiveInsights.burnoutRisk}
                </span>
              </div>

              <div className="rounded-xl bg-white/[0.04] p-3">
                <p className="text-xs uppercase tracking-wider text-white/40 mb-2">Optimal focus hours</p>
                <div className="flex gap-2">
                  {predictiveInsights.optimalFocusHours.map((hour) => (
                    <span key={hour} className="rounded-lg bg-amber-500/20 px-2 py-1 text-sm font-medium text-amber-300">
                      {hour}:00
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </GlassCard>
      </motion.div>

      {/* Distraction Analysis */}
      <motion.div variants={item}>
        <GlassCard title="Distraction Analysis" subtitle="Pattern detection" accentColor="#ff8a8a" delay={0.15}>
          <div className="grid gap-6 md:grid-cols-2">
            {/* Left: Stats */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-white/60">Most visited distraction</span>
                <span className="font-medium text-rose-300">{distractionPatterns.mostFrequentDistraction}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-white/60">Avg distraction duration</span>
                <span className="font-medium text-white">{Math.round(distractionPatterns.avgDistractionDuration / 60)}m</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-white/60">Rapid-switch bursts</span>
                <span className="font-medium text-amber-400">{distractionPatterns.rapidSwitchBursts.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-white/60">Dopamine cycles</span>
                <span className="font-medium text-rose-400">{distractionPatterns.dopamineCycles.length}</span>
              </div>

              {distractionPatterns.peakDistractionHours.length > 0 && (
                <div className="rounded-xl bg-rose-500/10 p-3 mt-4">
                  <p className="text-xs uppercase tracking-wider text-rose-300/70 mb-1">Peak distraction hours</p>
                  <div className="flex gap-2">
                    {distractionPatterns.peakDistractionHours.map((hour) => (
                      <span key={hour} className="rounded-lg bg-rose-500/20 px-2 py-1 text-sm font-medium text-rose-300">
                        {hour}:00
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right: Social Media Loops */}
            <div>
              <p className="text-xs uppercase tracking-wider text-white/40 mb-3">Social media patterns</p>
              {distractionPatterns.socialMediaLoops.length === 0 ? (
                <p className="text-sm text-white/30">No social media loops detected today ✨</p>
              ) : (
                <div className="space-y-2">
                  {distractionPatterns.socialMediaLoops.slice(0, 4).map((loop) => (
                    <div key={loop.platform} className="flex items-center justify-between rounded-xl bg-white/[0.04] p-2">
                      <span className="text-sm text-white/70">{loop.platform}</span>
                      <div className="text-right">
                        <span className="text-sm font-medium text-rose-300">{loop.visitCount}x</span>
                        <span className="ml-2 text-xs text-white/40">{Math.round(loop.totalDuration / 60)}m total</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Recommendations */}
      <motion.div variants={item} className="grid gap-6 lg:grid-cols-2">
        {/* Focus Improvements */}
        <GlassCard title="Focus Improvements" subtitle="Personalized tips" accentColor="#58f0ff" delay={0.2}>
          {productivityAdvice.focusImprovements.length === 0 ? (
            <div className="flex items-center gap-3 py-4">
              <span className="text-2xl">🎯</span>
              <p className="text-sm text-white/60">Great work! No immediate improvements needed.</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {productivityAdvice.focusImprovements.map((tip, i) => (
                <li key={i} className="flex gap-3 text-sm">
                  <span className="flex-shrink-0 text-neon">→</span>
                  <span className="text-white/70">{tip}</span>
                </li>
              ))}
            </ul>
          )}
        </GlassCard>

        {/* Distraction Reduction */}
        <GlassCard title="Distraction Reduction" subtitle="Actionable advice" accentColor="#ff8a8a" delay={0.25}>
          {productivityAdvice.distractionReduction.length === 0 ? (
            <div className="flex items-center gap-3 py-4">
              <span className="text-2xl">✨</span>
              <p className="text-sm text-white/60">Excellent focus today! Keep it up.</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {productivityAdvice.distractionReduction.map((tip, i) => (
                <li key={i} className="flex gap-3 text-sm">
                  <span className="flex-shrink-0 text-rose-400">!</span>
                  <span className="text-white/70">{tip}</span>
                </li>
              ))}
            </ul>
          )}
        </GlassCard>
      </motion.div>

      {/* Best Study Time */}
      <motion.div variants={item}>
        <GlassCard title="Optimal Study Time" subtitle="Based on your patterns" accentColor="#4ade80" delay={0.3}>
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/20 text-2xl">
              ⏰
            </div>
            <div>
              <p className="text-sm leading-relaxed text-white/70">{productivityAdvice.bestStudyTime}</p>
              {productivityAdvice.lifestyleInsight && (
                <p className="mt-3 rounded-xl bg-amber-500/10 p-3 text-sm text-amber-200/80">
                  💡 {productivityAdvice.lifestyleInsight}
                </p>
              )}
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Streak & Leaderboard Metrics */}
      <motion.div variants={item}>
        <GlassCard title="Progress Tracker" subtitle="Your journey" accentColor="#9c6bff" delay={0.35}>
          <div className="grid gap-4 sm:grid-cols-4">
            <div className="rounded-xl bg-white/[0.04] p-4 text-center">
              <p className="font-display text-3xl font-bold text-neon">{leaderboardMetrics.currentStreak}</p>
              <p className="text-xs uppercase tracking-wider text-white/40">Day streak</p>
            </div>
            <div className="rounded-xl bg-white/[0.04] p-4 text-center">
              <p className="font-display text-3xl font-bold text-aurora">{leaderboardMetrics.longestStreak}</p>
              <p className="text-xs uppercase tracking-wider text-white/40">Best streak</p>
            </div>
            <div className="rounded-xl bg-white/[0.04] p-4 text-center">
              <p className="font-display text-3xl font-bold text-amber-400">
                {leaderboardMetrics.improvementPercent !== null 
                  ? `${leaderboardMetrics.improvementPercent > 0 ? "+" : ""}${leaderboardMetrics.improvementPercent}%`
                  : "—"}
              </p>
              <p className="text-xs uppercase tracking-wider text-white/40">vs last week</p>
            </div>
            <div className="rounded-xl bg-white/[0.04] p-4 text-center">
              <p className="font-display text-3xl font-bold text-plasma">{leaderboardMetrics.weeklyPercentile}%</p>
              <p className="text-xs uppercase tracking-wider text-white/40">Percentile</p>
            </div>
          </div>
        </GlassCard>
      </motion.div>
    </motion.div>
  );
}
