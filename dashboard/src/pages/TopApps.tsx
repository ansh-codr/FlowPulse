import { motion } from "framer-motion";
import { GlassCard } from "../components/GlassCard";
import { AppsPie } from "../components/charts";
import { useDashboardData } from "../hooks/useDashboardData";

export function TopAppsPage() {
  const { apps, loading } = useDashboardData();

  if (loading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <p className="text-xs uppercase tracking-[0.4em] text-white/30">Loading apps…</p>
      </div>
    );
  }

  const maxMinutes = Math.max(...apps.map((a) => a.minutes), 1);

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <p className="text-xs uppercase tracking-[0.4em] text-white/30">Usage Analytics</p>
        <h1 className="font-display text-4xl font-bold tracking-tight text-white">Top Apps & Web</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <GlassCard title="Usage split" subtitle="Time per app / domain" accentColor="#9c6bff">
          <AppsPie data={apps} />
        </GlassCard>

        <GlassCard title="Stack detail" subtitle="Productivity signature" accentColor="#58f0ff" delay={0.05}>
          {apps.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-12 text-center">
              <p className="text-sm text-white/40">No domain data yet</p>
              <p className="text-xs text-white/25">Browse with the extension active</p>
            </div>
          ) : (
            <div className="space-y-3">
              {apps.map((app, i) => {
                const pct = (app.minutes / maxMinutes) * 100;
                return (
                  <motion.div
                    key={app.name}
                    className="space-y-1.5"
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05, duration: 0.35 }}
                  >
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2.5">
                        <span
                          className="h-2.5 w-2.5 flex-shrink-0 rounded-full"
                          style={{ background: app.color, boxShadow: `0 0 8px ${app.color}60` }}
                        />
                        <span className="font-medium text-white">{app.name}</span>
                        <span className="text-[10px] uppercase tracking-wider text-white/30">{app.category}</span>
                      </div>
                      <span className="font-bold" style={{ color: app.color }}>
                        {app.minutes}m
                      </span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: `linear-gradient(90deg, ${app.color}cc, ${app.color}66)` }}
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ delay: i * 0.05 + 0.2, duration: 0.7, ease: "easeOut" }}
                      />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
}
