import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
} from "recharts";
import type { DailyStats } from "../../../shared/types";

interface WeeklyTrendsProps {
  data: DailyStats[];
}

const tooltipStyle = {
  background: "rgba(3,8,20,0.8)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: "16px",
  color: "white",
  fontSize: "12px",
  padding: "8px 12px",
};

export function WeeklyTrends({ data }: WeeklyTrendsProps) {
  if (data.length === 0) {
    return <p className="py-8 text-center text-sm text-white/40">No weekly data yet</p>;
  }

  // Sort chronologically (oldest first)
  const sorted = [...data].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const chartData = sorted.map((stat) => ({
    date: stat.date.slice(5), // "MM-DD"
    focusScore: stat.focusScore,
    productiveMinutes: Math.round(stat.productiveTime / 60),
    distractionMinutes: Math.round(stat.distractionTime / 60),
  }));

  const avgScore =
    Math.round(sorted.reduce((sum, s) => sum + s.focusScore, 0) / sorted.length);

  return (
    <div className="space-y-4">
      <div className="flex items-baseline gap-4">
        <p className="text-sm text-white/60">
          7-day average:{" "}
          <span className="text-lg font-semibold text-neon">{avgScore}</span>
        </p>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={chartData} margin={{ left: 0, right: 0, top: 12, bottom: 0 }}>
          <defs>
            <linearGradient id="weeklyFocus" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#58f0ff" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#58f0ff" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <XAxis dataKey="date" stroke="#7c84ff" tickLine={false} axisLine={false} tickMargin={10} />
          <YAxis domain={[0, 100]} hide />
          <Tooltip contentStyle={tooltipStyle} />
          <ReferenceLine y={avgScore} stroke="#9c6bff" strokeDasharray="4 4" strokeOpacity={0.5} />
          <Area
            type="monotone"
            dataKey="focusScore"
            stroke="#58f0ff"
            fill="url(#weeklyFocus)"
            strokeWidth={3}
            name="Focus Score"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
