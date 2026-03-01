import { motion } from "framer-motion";
import { GlassCard } from "../components/GlassCard";
import { FocusRing } from "../components/FocusRing";
import { StatTicker } from "../components/StatTicker";
import { ActiveBar, FocusTimeline, MiniPie } from "../components/charts";
import { KpiCard } from "../components/KpiCard";
import { useDashboardData } from "../hooks/useDashboardData";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] } },
};

const kpiAccents = ["#58f0ff", "#9c6bff", "#f5c842", "#4ade80"];

export function HomePage() {
  const { overview, timeline, attention, distractions, kpis, loading } = useDashboardData();

  if (loading || !overview) {
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

  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const dateStr = now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  return (
    <motion.div className="space-y-6" variants={container} initial="hidden" animate="show">
      {/* Header */}
      <motion.header variants={item} className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-1.5 w-1.5 animate-pulse-glow rounded-full bg-neon shadow-glow-neon" />
            <p className="text-xs uppercase tracking-[0.4em] text-white/30">{dateStr}</p>
          </div>
          <h1 className="font-display text-4xl font-bold leading-tight tracking-tight text-white">
            {greeting} 👋
          </h1>
          <p className="text-sm text-white/40">Here's your cognitive snapshot for today.</p>
        </div>
        <motion.button
          className="group relative overflow-hidden rounded-xl border border-white/[0.10] bg-white/[0.05] px-5 py-2.5 text-sm font-medium text-white/70 transition hover:border-neon/30 hover:text-white"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/[0.06] to-transparent transition-transform duration-700 group-hover:translate-x-full" />
          Generate Report
        </motion.button>
      </motion.header>

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
      <motion.div variants={item} className="grid gap-6 lg:grid-cols-[280px_1fr]">
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
            <p className="leading-relaxed text-sm">
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
