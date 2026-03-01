import { useEffect, useState } from "react";
import { GlassCard } from "../components/GlassCard";
import { FocusRing } from "../components/FocusRing";
import { StatTicker } from "../components/StatTicker";
import { ActiveBar, FocusTimeline, MiniPie } from "../components/charts";
import { KpiCard } from "../components/KpiCard";
import type {
  AttentionSlice,
  DashboardKpis,
  OverviewStats,
  TimelineBlock,
} from "../../../shared/types";
import { mockApi } from "../mock/mockData";

export function HomePage() {
  const [overview, setOverview] = useState<OverviewStats | null>(null);
  const [timeline, setTimeline] = useState<TimelineBlock[]>([]);
  const [attention, setAttention] = useState<AttentionSlice[]>([]);
  const [distractions, setDistractions] = useState<AttentionSlice[]>([]);
  const [kpis, setKpis] = useState<DashboardKpis | null>(null);

  useEffect(() => {
    mockApi.getOverview().then(setOverview);
    mockApi.getTimeline().then(setTimeline);
    mockApi.getAttentionSplit().then(setAttention);
    mockApi.getDistractionSplit().then(setDistractions);
    mockApi.getKpis().then(setKpis);
  }, []);

  if (!overview) {
    return <p className="text-white/60">Booting FlowPulse HUD...</p>;
  }

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between text-white">
        <div>
        {kpis && (
          <div className="grid gap-4 md:grid-cols-4">
            <KpiCard label="Context Switches" value={`${kpis.contextSwitches}`} caption="tracked today" />
            <KpiCard label="Longest Session" value={`${kpis.longestSession}m`} caption="flow lock" />
            <KpiCard label="Deepest Block" value={kpis.deepestBlock} caption="neuro focus" />
            <KpiCard label="Shipped" value={`${kpis.shippedArtifacts}`} caption="artifacts today" />
          </div>
        )}
          <p className="text-sm uppercase tracking-[0.4em] text-white/50">Today</p>
          <h1 className="font-display text-4xl tracking-tight">Command Center</h1>
        </div>
        <button className="rounded-full border border-white/20 bg-white/10 px-6 py-2 text-sm">
          Generate Report
        </button>
      </header>
      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <GlassCard title="Focus Score" subtitle="Live orbital ring" corner={<span className="text-xs text-white/70">Liquid AI</span>}>
          <div className="flex items-center justify-between gap-6">
            <FocusRing value={overview.focusScore} />
            <div className="space-y-6">
              <StatTicker value={overview.totalActiveMinutes} label="Active Minutes" suffix="m" />
              <StatTicker value={overview.distractionCount} label="Distractions" />
              <StatTicker value={overview.streakDays} label="Day Streak" suffix="d" />
            </div>
          </div>
        </GlassCard>
        <GlassCard title="Cognitive altitude" subtitle="Focus waves" corner={<span className="text-xs text-white/70">09:00 → 22:00</span>}>
          <FocusTimeline data={timeline} />
        </GlassCard>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <GlassCard title="Active minutes" subtitle="Sustained burn" >
          <ActiveBar data={timeline} />
        </GlassCard>
        <GlassCard title="Dominant channel" subtitle={overview.topCategory}>
          <div className="space-y-4 text-white/80">
            <p>
              The AI senses a strong creative surge. You held deep focus streaks for
              <span className="text-white"> 47 min</span> avg.
            </p>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {timeline.slice(0, 4).map((block) => (
                <div key={block.hour} className="rounded-2xl border border-white/10 bg-white/5 px-3 py-3">
                  <p className="text-white/80">{block.hour}</p>
                  <p className="text-xs uppercase tracking-[0.3em] text-white/40">{block.focusLevel}</p>
                  <p className="text-lg font-semibold text-neon">{block.focusScore}%</p>
                </div>
              ))}
            </div>
          </div>
        </GlassCard>
      </div>
      {(attention.length || distractions.length) && (
        <div className="grid gap-6 lg:grid-cols-2">
          <GlassCard title="Attention split" subtitle="Signal allocation">
            <div className="grid gap-4 md:grid-cols-[200px_1fr]">
              <MiniPie data={attention} />
              <div className="space-y-3 text-sm text-white/70">
                {attention.map((slice) => (
                  <div key={slice.label} className="flex items-center gap-3">
                    <span className="h-3 w-3 rounded-full" style={{ background: slice.color }} />
                    <p className="flex-1">{slice.label}</p>
                    <p className="text-white">{slice.value}%</p>
                  </div>
                ))}
              </div>
            </div>
          </GlassCard>
          <GlassCard title="Distraction radar" subtitle="Pulling you out of orbit">
            <div className="grid gap-4 md:grid-cols-[200px_1fr]">
              <MiniPie data={distractions} />
              <div className="space-y-3 text-sm text-white/70">
                {distractions.map((slice) => (
                  <div key={slice.label} className="flex items-center gap-3">
                    <span className="h-3 w-3 rounded-full" style={{ background: slice.color }} />
                    <p className="flex-1">{slice.label}</p>
                    <p className="text-white">{slice.value}%</p>
                  </div>
                ))}
              </div>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
}
