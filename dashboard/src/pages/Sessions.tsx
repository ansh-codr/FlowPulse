import clsx from "clsx";
import { GlassCard } from "../components/GlassCard";
import { useDashboardData } from "../hooks/useDashboardData";

const focusChip: Record<string, string> = {
  deep: "bg-emerald-400/20 text-emerald-200",
  flow: "bg-sky-400/20 text-sky-200",
  shallow: "bg-amber-400/20 text-amber-200",
  distracted: "bg-rose-400/20 text-rose-200",
};

export function SessionsPage() {
  const { sessions, loading } = useDashboardData();

  if (loading) return <p className="text-white/60">Loading sessions…</p>;

  return (
    <div className="space-y-8">
      <h1 className="font-display text-3xl text-white">Session Breakdown</h1>
      <GlassCard title="Chrono sessions" subtitle="Synth streak">
        {sessions.length === 0 ? (
          <p className="text-white/40 text-sm">No sessions recorded yet today.</p>
        ) : (
          <div className="space-y-3">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="grid gap-3 rounded-2xl border border-white/5 bg-white/5 px-4 py-3 md:grid-cols-4"
              >
                <div>
                  <p className="text-sm text-white/60">Start</p>
                  <p className="text-white">{new Date(session.start).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
                </div>
                <div>
                  <p className="text-sm text-white/60">End</p>
                  <p className="text-white">{new Date(session.end).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
                </div>
                <div>
                  <p className="text-sm text-white/60">Duration</p>
                  <p className="text-white font-semibold">{session.durationMinutes} min</p>
                </div>
                <div className="flex items-center justify-between">
                  <span
                    className={clsx(
                      "rounded-full px-3 py-1 text-xs uppercase",
                      focusChip[session.focusLevel]
                    )}
                  >
                    {session.focusLevel}
                  </span>
                  {session.notes && <p className="text-xs text-white/60">{session.notes}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </GlassCard>
    </div>
  );
}
