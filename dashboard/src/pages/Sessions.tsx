import { motion } from "framer-motion";
import clsx from "clsx";
import { GlassCard } from "../components/GlassCard";
import { useDashboardData } from "../hooks/useDashboardData";

const focusConfig: Record<string, { chip: string; border: string; label: string }> = {
  deep: { chip: "bg-emerald-400/15 text-emerald-300", border: "#4ade80", label: "Deep Work" },
  flow: { chip: "bg-sky-400/15 text-sky-300", border: "#38bdf8", label: "Flow State" },
  shallow: { chip: "bg-amber-400/15 text-amber-300", border: "#fbbf24", label: "Shallow" },
  distracted: { chip: "bg-rose-400/15 text-rose-300", border: "#fb7185", label: "Distracted" },
};

export function SessionsPage() {
  const { sessions, loading } = useDashboardData();

  if (loading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <p className="text-xs uppercase tracking-[0.4em] text-white/30">Loading sessions…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <p className="text-xs uppercase tracking-[0.4em] text-white/30">Activity Log</p>
        <h1 className="font-display text-4xl font-bold tracking-tight text-white">Session Breakdown</h1>
      </div>

      <GlassCard title="Chrono sessions" subtitle="Your recorded work blocks" accentColor="#6d6dff">
        {sessions.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.04] text-white/20">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-sm text-white/40">No sessions recorded yet today</p>
          </div>
        ) : (
          <div className="space-y-2">
            {sessions.map((session, i) => {
              const cfg = focusConfig[session.focusLevel] ?? focusConfig.shallow;
              const startTime = new Date(session.start).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
              const endTime = new Date(session.end).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
              return (
                <motion.div
                  key={session.id}
                  className="flex items-center gap-4 rounded-xl border border-white/[0.05] bg-white/[0.03] p-4"
                  style={{ borderLeft: `3px solid ${cfg.border}` }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.35 }}
                >
                  {/* Time range */}
                  <div className="min-w-[90px]">
                    <p className="text-sm font-semibold text-white">{startTime}</p>
                    <p className="text-xs text-white/30">→ {endTime}</p>
                  </div>

                  {/* Duration badge */}
                  <div
                    className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-sm font-bold"
                    style={{ background: `${cfg.border}18`, color: cfg.border }}
                  >
                    {session.durationMinutes}m
                  </div>

                  {/* Focus level chip */}
                  <span className={clsx("flex-1 rounded-full px-3 py-1 text-xs font-medium uppercase tracking-wider max-w-[120px] text-center", cfg.chip)}>
                    {cfg.label}
                  </span>

                  {session.notes && (
                    <p className="flex-1 truncate text-xs text-white/40">{session.notes}</p>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </GlassCard>
    </div>
  );
}
