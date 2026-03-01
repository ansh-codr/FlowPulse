import { motion } from "framer-motion";
import { GlassCard } from "../components/GlassCard";
import { FocusTimeline, ActiveBar } from "../components/charts";
import { useDashboardData } from "../hooks/useDashboardData";

const categoryBorderColor: Record<string, string> = {
  work: "#58f0ff",
  communication: "#9c6bff",
  social: "#ff8a8a",
  entertainment: "#f5c842",
  news: "#4ade80",
  other: "rgba(255,255,255,0.2)",
};

export function TimelinePage() {
  const { timeline, events, loading } = useDashboardData();

  if (loading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <p className="text-xs uppercase tracking-[0.4em] text-white/30">Loading timeline…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <p className="text-xs uppercase tracking-[0.4em] text-white/30">Day View</p>
        <h1 className="font-display text-4xl font-bold tracking-tight text-white">Timeline</h1>
      </div>

      <GlassCard title="Chrono band" subtitle="Hour-by-hour focus signal" accentColor="#9c6bff">
        <FocusTimeline data={timeline} />
      </GlassCard>

      <GlassCard title="Activation" subtitle="Active minutes per hour" accentColor="#58f0ff" delay={0.05}>
        <ActiveBar data={timeline} />
      </GlassCard>

      <GlassCard title="Event Stream" subtitle="Live from extension relay" accentColor="#6d6dff" delay={0.1}>
        {events.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.04] text-white/20">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
            </div>
            <p className="text-sm text-white/40">No events yet today</p>
            <p className="text-xs text-white/25">Start browsing with the extension active</p>
          </div>
        ) : (
          <div className="grid gap-2 max-h-[480px] overflow-y-auto pr-1">
            {events.slice(0, 50).map((event, i) => {
              const borderColor = categoryBorderColor[event.category?.toLowerCase() ?? ""] ?? categoryBorderColor.other;
              return (
                <motion.div
                  key={event.id}
                  className="flex items-center justify-between rounded-xl border border-white/[0.05] bg-white/[0.03] px-4 py-3"
                  style={{ borderLeft: `3px solid ${borderColor}` }}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.025, duration: 0.3 }}
                >
                  <div className="min-w-0 flex-1 pr-4">
                    <p className="truncate text-sm font-semibold text-white">{event.title}</p>
                    <p className="mt-0.5 truncate text-xs text-white/40">
                      {new Date(event.start).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      {event.url && ` · ${event.url}`}
                    </p>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <p className="font-display text-lg font-bold text-neon">{event.focusScore}%</p>
                    <p className="text-[10px] uppercase tracking-[0.3em] text-white/30">{event.category}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </GlassCard>
    </div>
  );
}
