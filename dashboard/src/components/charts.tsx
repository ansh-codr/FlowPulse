import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import type { AppUsage, AttentionSlice, TimelineBlock } from "../../../shared/types";

const tooltipStyle = {
  background: "rgba(5,6,10,0.95)",
  border: "1px solid rgba(88,240,255,0.15)",
  borderRadius: "12px",
  color: "white",
  fontSize: "12px",
  padding: "8px 14px",
  boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
};

export function FocusTimeline({ data }: { data: TimelineBlock[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ left: 0, right: 0, top: 12, bottom: 0 }}>
        <defs>
          <linearGradient id="focusArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#58f0ff" stopOpacity={0.5} />
            <stop offset="60%" stopColor="#9c6bff" stopOpacity={0.2} />
            <stop offset="100%" stopColor="#6d6dff" stopOpacity={0.02} />
          </linearGradient>
          <linearGradient id="focusLine" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#9c6bff" />
            <stop offset="100%" stopColor="#58f0ff" />
          </linearGradient>
          <filter id="area-glow">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <XAxis
          dataKey="hour"
          stroke="rgba(255,255,255,0.15)"
          tickLine={false}
          axisLine={false}
          tickMargin={10}
          style={{ fontSize: "11px" }}
        />
        <Tooltip
          contentStyle={tooltipStyle}
          cursor={{ stroke: "rgba(88,240,255,0.3)", strokeWidth: 1, strokeDasharray: "4 4" }}
        />
        <Area
          type="monotone"
          dataKey="focusScore"
          stroke="url(#focusLine)"
          fill="url(#focusArea)"
          strokeWidth={2.5}
          dot={false}
          activeDot={{ r: 5, fill: "#58f0ff", stroke: "rgba(88,240,255,0.4)", strokeWidth: 4 }}
          filter="url(#area-glow)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function ActiveBar({ data }: { data: TimelineBlock[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ left: -20, right: 0, top: 12, bottom: 0 }}>
        <defs>
          <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#58f0ff" stopOpacity={0.9} />
            <stop offset="100%" stopColor="#6d6dff" stopOpacity={0.5} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="hour"
          stroke="rgba(255,255,255,0.15)"
          tickLine={false}
          axisLine={false}
          tickMargin={10}
          style={{ fontSize: "11px" }}
        />
        <Tooltip
          contentStyle={tooltipStyle}
          cursor={{ fill: "rgba(88,240,255,0.06)" }}
        />
        <Bar dataKey="activeMinutes" radius={[8, 8, 0, 0]} fill="url(#barGradient)" />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function AppsPie({ data }: { data: AppUsage[] }) {
  const payload = data.map((entry) => ({ ...entry })) as Array<Record<string, string | number>>;
  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Tooltip contentStyle={tooltipStyle} />
        <Pie
          data={payload}
          dataKey="minutes"
          nameKey="name"
          innerRadius={65}
          outerRadius={100}
          paddingAngle={3}
          strokeWidth={0}
        >
          {data.map((entry) => (
            <Cell key={entry.name} fill={entry.color} />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
}

export function MiniPie({ data }: { data: AttentionSlice[] }) {
  const payload = data.map((entry) => ({
    name: entry.label,
    value: entry.value,
    fill: entry.color,
  }));
  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Tooltip contentStyle={tooltipStyle} />
        <Pie
          data={payload}
          dataKey="value"
          innerRadius={50}
          outerRadius={80}
          paddingAngle={3}
          strokeWidth={0}
        >
          {payload.map((entry) => (
            <Cell key={entry.name} fill={entry.fill} />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
}
