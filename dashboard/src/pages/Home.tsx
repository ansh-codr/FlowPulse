import { useEffect, useMemo, useState } from "react";
import { motion, type Variants } from "framer-motion";
import { GlassCard } from "../components/GlassCard";
import { FocusRing } from "../components/FocusRing";
import { StatTicker } from "../components/StatTicker";
import { ActiveBar, FocusTimeline, MiniPie } from "../components/charts";
import { KpiCard } from "../components/KpiCard";
import { useDashboardData } from "../hooks/useDashboardData";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import {
  getMobileActivitySummaries,
  getWeeklyCombinedAnalytics,
  subscribeToHealthAlerts,
} from "../lib/firestoreQueries";
import type { CombinedAnalyticsDaily, HealthAlert, MobileActivitySummary } from "../../../shared/types";

const container: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const item: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

const kpiAccents = ["#58f0ff", "#9c6bff", "#f5c842", "#4ade80"];
const MOBILE_FEATURE_VERSION = "mobile-health-connect-v1";

function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function HomePage() {
  const { user } = useAuth();
  const { overview, timeline, attention, distractions, kpis, loading, hasData } = useDashboardData();
  const [mobileSummaries, setMobileSummaries] = useState<MobileActivitySummary[]>([]);
  const [combinedAnalytics, setCombinedAnalytics] = useState<CombinedAnalyticsDaily[]>([]);
  const [healthAlerts, setHealthAlerts] = useState<HealthAlert[]>([]);
  const [isLoadingMobile, setIsLoadingMobile] = useState(false);
  const [showFeaturePulse, setShowFeaturePulse] = useState(false);

  useEffect(() => {
    const seenKey = `fp_feature_seen_${MOBILE_FEATURE_VERSION}`;
    setShowFeaturePulse(localStorage.getItem(seenKey) !== "1");
  }, []);

  useEffect(() => {
    if (!user?.uid) {
      setMobileSummaries([]);
      setCombinedAnalytics([]);
      setHealthAlerts([]);
      return;
    }

    setIsLoadingMobile(true);
    Promise.all([
      getMobileActivitySummaries(7),
      getWeeklyCombinedAnalytics(user.uid),
    ])
      .then(([summaries, combined]) => {
        setMobileSummaries(summaries);
        setCombinedAnalytics(combined);
      })
      .finally(() => setIsLoadingMobile(false));

    const unsubscribeAlerts = subscribeToHealthAlerts(user.uid, setHealthAlerts);
    return () => unsubscribeAlerts();
  }, [user?.uid]);

  const todaySummary = useMemo(() => {
    const today = toIsoDate(new Date());
    return mobileSummaries.find((summary) => summary.date === today) ?? mobileSummaries[0] ?? null;
  }, [mobileSummaries]);

  const latestCombined = combinedAnalytics[0] ?? null;

  function markFeatureAsSeen() {
    localStorage.setItem(`fp_feature_seen_${MOBILE_FEATURE_VERSION}`, "1");
    setShowFeaturePulse(false);
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative h-12 w-12">
            <div className="absolute inset-0 rounded-full border-2 border-neon/20" />
            <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-neon" />
          </div>
          <p className="text-xs uppercase tracking-[0.4em] text-white/30">Booting HUD…</p>
        </div>
      </div>
    );
  }

  // Empty state — no data yet
  if (!hasData) {
    return (
      <motion.div
        className="flex flex-col items-center justify-center gap-8 py-20"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="relative h-20 w-20">
          <div className="absolute inset-0 rounded-full border-2 border-neon/10" />
          <div className="absolute inset-2 rounded-full border-2 border-dashed border-neon/20 animate-spin" style={{ animationDuration: "12s" }} />
          <div className="absolute inset-0 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-neon/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
        </div>
        <div className="text-center space-y-2">
          <h2 className="font-display text-2xl font-bold text-white">No Data Yet</h2>
          <p className="text-sm text-white/40 max-w-md">
            Install the FlowPulse Chrome extension and start browsing to see your focus data here.
          </p>
          <div className="pt-3">
            <Link
              to="/extension"
              className="inline-flex items-center gap-2 rounded-xl border border-neon/30 bg-neon/10 px-4 py-2 text-xs font-semibold text-neon transition hover:bg-neon/20"
            >
              Download Extension
            </Link>
          </div>
        </div>
      </motion.div>
    );
  }

  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const dateStr = now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  return (
    <motion.div className="space-y-6 overflow-x-hidden" variants={container} initial="hidden" animate="show">
      {/* New Features */}
      <motion.div variants={item}>
        <GlassCard
          title="New Features Implemented"
          subtitle="Mobile health sync and behavior reminders"
          accentColor="#6ef5b1"
          corner={
            showFeaturePulse ? (
              <span className="feature-blink-badge rounded-full border border-emerald-300/50 bg-emerald-300/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-200">
                New
              </span>
            ) : (
              <span className="rounded-full border border-white/15 bg-white/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/60">
                Seen
              </span>
            )
          }
        >
          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-sm text-white/80">
              <p className="font-semibold text-white">Health Connect Sync</p>
              <p className="mt-1 text-white/50">Daily steps, active minutes, and session counts from Android.</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-sm text-white/80">
              <p className="font-semibold text-white">Cross-Device Patterns</p>
              <p className="mt-1 text-white/50">Desktop screen time is now analyzed against movement trends.</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-sm text-white/80">
              <p className="font-semibold text-white">Health Reminders</p>
              <p className="mt-1 text-white/50">You now get prompts like low movement and high screen usage alerts.</p>
            </div>
          </div>
          {showFeaturePulse && (
            <div className="mt-4 flex justify-end">
              <button
                onClick={markFeatureAsSeen}
                className="rounded-lg border border-white/20 bg-white/5 px-3 py-1.5 text-xs text-white/70 transition hover:bg-white/10 hover:text-white"
              >
                Mark as seen
              </button>
            </div>
          )}
        </GlassCard>
      </motion.div>

      {/* Header */}
      <motion.header variants={item} className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-1.5 w-1.5 animate-pulse-glow rounded-full bg-neon shadow-glow-neon" />
            <p className="text-xs uppercase tracking-[0.4em] text-white/30">{dateStr}</p>
          </div>
          <h1 className="font-display text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl">
            {greeting} 👋
          </h1>
          <p className="max-w-[56ch] text-sm leading-relaxed text-white/40">
            Here&apos;s your cognitive snapshot for today.
            {user?.email ? ` Connected Gmail ID: ${user.email}` : ""}
          </p>
        </div>
        <motion.button
          className="group relative w-full overflow-hidden rounded-xl border border-white/[0.10] bg-white/[0.05] px-5 py-2.5 text-sm font-medium text-white/70 transition hover:border-neon/30 hover:text-white sm:w-auto"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/[0.06] to-transparent transition-transform duration-700 group-hover:translate-x-full" />
          Generate Report
        </motion.button>
      </motion.header>

      {/* Mobile Activity + Reminders */}
      <motion.div variants={item} className="grid gap-6 lg:grid-cols-2">
        <GlassCard title="Mobile Activity (Health Connect)" subtitle="Today&apos;s synced activity" accentColor="#58f0ff">
          {isLoadingMobile ? (
            <p className="text-sm text-white/40">Loading mobile activity…</p>
          ) : !todaySummary ? (
            <div className="space-y-3 text-sm text-white/60">
              <p>No synced mobile activity yet.</p>
              <Link to="/app/settings" className="inline-flex rounded-lg border border-neon/30 bg-neon/10 px-3 py-1.5 text-xs font-medium text-neon transition hover:bg-neon/20">
                Connect in Settings
              </Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-3 border-b border-white/[0.06] pb-4">
                <StatTicker value={todaySummary.step_count} label="Steps" accentColor="#6ef5b1" />
                <StatTicker value={todaySummary.active_minutes} label="Active Min" suffix="m" accentColor="#58f0ff" />
                <StatTicker value={todaySummary.activity_sessions} label="Sessions" accentColor="#f5c842" />
              </div>
              {latestCombined && (
                <div className="mt-4 flex flex-wrap gap-2 text-xs">
                  <span className={`rounded-full px-2 py-1 ${latestCombined.highScreenUsageLowPhysicalActivity ? "bg-rose-500/20 text-rose-300" : "bg-white/10 text-white/60"}`}>
                    {latestCombined.highScreenUsageLowPhysicalActivity ? "High screen + low movement" : "Screen/movement balanced"}
                  </span>
                  <span className={`rounded-full px-2 py-1 ${latestCombined.longSedentaryStudyDetected ? "bg-amber-500/20 text-amber-300" : "bg-white/10 text-white/60"}`}>
                    {latestCombined.longSedentaryStudyDetected ? "Long study without breaks detected" : "Break rhythm healthy"}
                  </span>
                  <span className={`rounded-full px-2 py-1 ${latestCombined.healthyLearningMovementBalance ? "bg-emerald-500/20 text-emerald-300" : "bg-white/10 text-white/60"}`}>
                    {latestCombined.healthyLearningMovementBalance ? "Healthy learning balance" : "Balance building"}
                  </span>
                </div>
              )}
            </>
          )}
        </GlassCard>

        <GlassCard title="Reminder Feed" subtitle="Latest health prompts" accentColor="#ff8a8a">
          {healthAlerts.length === 0 ? (
            <p className="text-sm text-white/40">No active reminders right now.</p>
          ) : (
            <div className="space-y-2">
              {healthAlerts.slice(0, 3).map((alert) => (
                <div key={alert.id} className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
                  <p className="text-sm text-white/80">{alert.message}</p>
                  <p className="mt-1 text-[10px] uppercase tracking-[0.22em] text-white/40">{alert.priority} priority</p>
                </div>
              ))}
            </div>
          )}
        </GlassCard>
      </motion.div>

      {/* KPI Cards */}
      {kpis && (
        <motion.div variants={item} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard label="Context Switches" value={`${kpis.contextSwitches}`} caption="tracked today" accentColor={kpiAccents[0]} />
          <KpiCard label="Longest Session" value={`${kpis.longestSession}m`} caption="flow lock" accentColor={kpiAccents[1]} />
          <KpiCard label="Deepest Block" value={kpis.deepestBlock} caption="neuro focus" accentColor={kpiAccents[2]} />
          <KpiCard label="Shipped" value={`${kpis.shippedArtifacts}`} caption="deep blocks" accentColor={kpiAccents[3]} />
        </motion.div>
      )}

      {/* Focus Ring + Cognitive Altitude */}
      <motion.div variants={item} className="grid gap-6 lg:grid-cols-[minmax(260px,280px)_1fr]">
        <GlassCard
          title="Focus Score"
          subtitle="Live orbital ring"
          corner={<span className="rounded-full bg-neon/10 px-2 py-0.5 text-[10px] font-medium text-neon">Liquid AI</span>}
          accentColor="#58f0ff"
        >
          <div className="flex flex-col items-center gap-6 py-2">
            <FocusRing value={overview.focusScore} />
            <div className="grid w-full grid-cols-3 gap-3 border-t border-white/[0.06] pt-4">
              <StatTicker value={overview.totalActiveMinutes} label="Active Min" suffix="m" accentColor="#58f0ff" />
              <StatTicker value={overview.distractionCount} label="Distracts" accentColor="#ff8a8a" />
              <StatTicker value={overview.streakDays} label="Day Streak" suffix="d" accentColor="#f5c842" />
            </div>
          </div>
        </GlassCard>

        <GlassCard
          title="Cognitive altitude"
          subtitle="Focus waves throughout the day"
          corner={<span className="text-xs text-white/30">09:00 → 22:00</span>}
          accentColor="#9c6bff"
          delay={0.05}
        >
          <FocusTimeline data={timeline} />
        </GlassCard>
      </motion.div>

      {/* Active + Dominant Channel */}
      <motion.div variants={item} className="grid gap-6 md:grid-cols-2">
        <GlassCard title="Active minutes" subtitle="Sustained energy burn" accentColor="#6d6dff" delay={0.1}>
          <ActiveBar data={timeline} />
        </GlassCard>

        <GlassCard title="Dominant channel" subtitle={overview.topCategory} accentColor="#f5c842" delay={0.15}>
          <div className="space-y-4 text-white/80">
            <p className="text-sm leading-relaxed">
              {overview.focusScore >= 70
                ? <>Strong creative surge. Held deep focus for <span className="font-semibold text-white">{Math.round(overview.totalActiveMinutes / Math.max(1, timeline.length))} min</span> avg.</>
                : <>Mixed attention today. Try to protect a focused block this afternoon.</>
              }
            </p>
            <div className="grid grid-cols-2 gap-2">
              {timeline.slice(0, 4).map((block, i) => (
                <motion.div
                  key={block.hour}
                  className="rounded-xl border border-white/[0.06] bg-white/[0.04] px-3 py-3"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.06 }}
                >
                  <p className="text-sm font-medium text-white/70">{block.hour}</p>
                  <p className="text-[10px] uppercase tracking-[0.3em] text-white/30">{block.focusLevel}</p>
                  <p className="mt-1 font-display text-xl font-bold text-neon">{block.focusScore}%</p>
                </motion.div>
              ))}
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Attention + Distraction Radar */}
      {(attention.length > 0 || distractions.length > 0) && (
        <motion.div variants={item} className="grid gap-6 lg:grid-cols-2">
          <GlassCard title="Attention split" subtitle="Signal allocation" accentColor="#58f0ff" delay={0.2}>
            <div className="grid gap-4 md:grid-cols-[180px_1fr]">
              <MiniPie data={attention} />
              <div className="flex flex-col justify-center gap-3 text-sm text-white/70">
                {attention.map((slice) => (
                  <div key={slice.label} className="flex items-center gap-3">
                    <span className="h-2.5 w-2.5 flex-shrink-0 rounded-full" style={{ background: slice.color, boxShadow: `0 0 8px ${slice.color}60` }} />
                    <p className="flex-1">{slice.label}</p>
                    <p className="font-semibold text-white">{slice.value}%</p>
                  </div>
                ))}
              </div>
            </div>
          </GlassCard>

          <GlassCard title="Distraction radar" subtitle="Pulling you out of orbit" accentColor="#ff8a8a" delay={0.25}>
            <div className="grid gap-4 md:grid-cols-[180px_1fr]">
              <MiniPie data={distractions} />
              <div className="flex flex-col justify-center gap-3 text-sm text-white/70">
                {distractions.map((slice) => (
                  <div key={slice.label} className="flex items-center gap-3">
                    <span className="h-2.5 w-2.5 flex-shrink-0 rounded-full" style={{ background: slice.color, boxShadow: `0 0 8px ${slice.color}60` }} />
                    <p className="flex-1">{slice.label}</p>
                    <p className="font-semibold text-white">{slice.value}%</p>
                  </div>
                ))}
              </div>
            </div>
          </GlassCard>
        </motion.div>
      )}
    </motion.div>
  );
}
