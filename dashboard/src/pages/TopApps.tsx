import { useEffect, useState } from "react";
import type { AppUsage } from "../../../shared/types";
import { mockApi } from "../mock/mockData";
import { GlassCard } from "../components/GlassCard";
import { AppsPie } from "../components/charts";

export function TopAppsPage() {
  const [apps, setApps] = useState<AppUsage[]>([]);

  useEffect(() => {
    mockApi.getApps().then(setApps);
  }, []);

  return (
    <div className="space-y-8">
      <h1 className="font-display text-3xl text-white">Top Apps & Web</h1>
      <div className="grid gap-6 md:grid-cols-2">
        <GlassCard title="Usage split" subtitle="Minutes spent">
          <AppsPie data={apps} />
        </GlassCard>
        <GlassCard title="Stack detail" subtitle="Productivity signature">
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
        </GlassCard>
      </div>
    </div>
  );
}
