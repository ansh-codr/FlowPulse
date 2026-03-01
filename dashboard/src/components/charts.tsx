import { ResponsiveContainer, AreaChart, Area, XAxis, Tooltip, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
import type { AppUsage, AttentionSlice, TimelineBlock } from "../../../shared/types";

const tooltipStyle = {
  background: "rgba(3,8,20,0.8)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: "16px",
  color: "white",
  fontSize: "12px",
  padding: "8px 12px",
};

export function FocusTimeline({ data }: { data: TimelineBlock[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ left: 0, right: 0, top: 12, bottom: 0 }}>
        <defs>
          <linearGradient id="focusArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#58f0ff" stopOpacity={0.9} />
            <stop offset="95%" stopColor="#58f0ff" stopOpacity={0.1} />
          </linearGradient>
        </defs>
        <XAxis dataKey="hour" stroke="#7c84ff" tickLine={false} axisLine={false} tickMargin={10} />
        <Tooltip contentStyle={tooltipStyle} cursor={{ stroke: "#58f0ff", strokeOpacity: 0.4 }} />
        <Area type="monotone" dataKey="focusScore" stroke="#7b6bff" fill="url(#focusArea)" strokeWidth={3} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function ActiveBar({ data }: { data: TimelineBlock[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ left: -20, right: 0, top: 12, bottom: 0 }}>
        <XAxis dataKey="hour" stroke="#7c84ff" tickLine={false} axisLine={false} tickMargin={10} />
        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(88,240,255,0.1)" }} />
        <Bar dataKey="activeMinutes" radius={12} fill="#58f0ff" />
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
        <Pie data={payload} dataKey="minutes" nameKey="name" innerRadius={55} outerRadius={95} paddingAngle={3}>
          {data.map((entry) => (
            <Cell key={entry.name} fill={entry.color} />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
}

export function MiniPie({ data }: { data: AttentionSlice[] }) {
  const payload = data.map((entry) => ({ name: entry.label, value: entry.value, fill: entry.color }));
  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Tooltip contentStyle={tooltipStyle} />
        <Pie data={payload} dataKey="value" innerRadius={45} outerRadius={70} paddingAngle={2}>
          {payload.map((entry) => (
            <Cell key={entry.name} fill={entry.fill} />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
}
