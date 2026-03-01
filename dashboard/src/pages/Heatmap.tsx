import { GlassCard } from "../components/GlassCard";
import { HeatmapGrid } from "../components/Heatmap";
import { useDashboardData } from "../hooks/useDashboardData";

export function HeatmapPage() {
  const { heatmap, loading } = useDashboardData();

  if (loading) return <p className="text-white/60">Loading heatmap…</p>;

  return (
    <div className="space-y-8">
      <h1 className="font-display text-3xl text-white">Heatmap</h1>
      <GlassCard title="Weekly intensity" subtitle="7 × 24 grid">
        <HeatmapGrid data={heatmap} />
      </GlassCard>
    </div>
  );
}
