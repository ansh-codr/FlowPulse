import { GlassCard } from "../components/GlassCard";
import { AppsPie } from "../components/charts";
import { useDashboardData } from "../hooks/useDashboardData";

export function TopAppsPage() {
  const { apps, loading } = useDashboardData();

  if (loading) return <p className="text-white/60">Loading apps…</p>;

  return (
    <div className="space-y-8">
      <h1 className="font-display text-3xl text-white">Top Apps & Web</h1>
      <div className="grid gap-6 md:grid-cols-2">
        <GlassCard title="Usage split" subtitle="Minutes spent">
          <AppsPie data={apps} />
        </GlassCard>
        <GlassCard title="Stack detail" subtitle="Productivity signature">
          {apps.length === 0 ? (
            <p className="text-white/40 text-sm">No domain data yet. Browse with the extension active.</p>
          ) : (
            <div className="space-y-4">
              {apps.map((app) => (
                <div key={app.name} className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/5 px-4 py-3">
                  <div>
                    <p className="font-semibold text-white">{app.name}</p>
                    <p className="text-xs uppercase tracking-[0.3em] text-white/40">{app.category}</p>
                  </div>
                  <p className="text-lg font-bold" style={{ color: app.color }}>
                    {app.minutes}m
                  </p>
                </div>
              ))}
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
}
