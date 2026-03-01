import { motion } from "framer-motion";
import { GlassCard } from "../components/GlassCard";
import { FocusTimeline, ActiveBar } from "../components/charts";
import { useDashboardData } from "../hooks/useDashboardData";

export function TimelinePage() {
  const { timeline, events, loading } = useDashboardData();

  if (loading) return <p className="text-white/60">Loading timeline…</p>;

  return (
    <div className="space-y-8">
      <h1 className="font-display text-3xl text-white">Timeline View</h1>
      <GlassCard title="Chrono band" subtitle="Hour-by-hour signal">
        <FocusTimeline data={timeline} />
      </GlassCard>
      <GlassCard title="Activation" subtitle="Minutes active / hour">
        <ActiveBar data={timeline} />
      </GlassCard>
      <GlassCard title="Event Stream" subtitle="Live from extension relay">
        {events.length === 0 ? (
          <p className="text-white/40 text-sm">No events recorded yet today. Start browsing with the extension active.</p>
        ) : (
          <div className="grid gap-3">
            {events.slice(0, 50).map((event) => (
              <motion.div
                key={event.id}
                className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/5 px-4 py-3 text-sm"
                initial={{ opacity: 0, translateY: 10 }}
                animate={{ opacity: 1, translateY: 0 }}
              >
                <div>
                  <p className="text-white font-semibold">{event.title}</p>
                  <p className="text-white/60 text-xs">{new Date(event.start).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} • {event.url}</p>
                </div>
                <div className="text-right">
                  <p className="text-neon text-lg font-bold">{event.focusScore}%</p>
                  <p className="text-xs uppercase tracking-[0.3em] text-white/40">{event.category}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </GlassCard>
    </div>
  );
}
