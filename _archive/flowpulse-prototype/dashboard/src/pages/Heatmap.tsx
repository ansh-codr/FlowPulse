import { useEffect, useState } from "react";
import type { HeatmapCell } from "../../../shared/types";
import { mockApi } from "../mock/mockData";
import { GlassCard } from "../components/GlassCard";
import { HeatmapGrid } from "../components/Heatmap";

export function HeatmapPage() {
  const [cells, setCells] = useState<HeatmapCell[]>([]);

  useEffect(() => {
    mockApi.getHeatmap().then(setCells);
  }, []);

  return (
    <div className="space-y-8">
      <h1 className="font-display text-3xl text-white">Heatmap</h1>
      <GlassCard title="Weekly intensity" subtitle="7 × 24 grid">
        <HeatmapGrid data={cells} />
      </GlassCard>
    </div>
  );
}
