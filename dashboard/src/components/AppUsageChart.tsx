import { Pie, PieChart, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { ActivityEvent } from "../state/useActivityStore";

const COLORS = ["#a855f7", "#22d3ee", "#f97316", "#38bdf8", "#e11d48"];

type Props = {
  events: ActivityEvent[];
};

export function AppUsageChart({ events }: Props) {
  const grouped = events.reduce<Record<string, number>>((acc, evt) => {
    const domain = new URL(evt.url).hostname.replace("www.", "");
    acc[domain] = (acc[domain] ?? 0) + evt.active_seconds;
    return acc;
  }, {});

  const data = Object.entries(grouped)
    .map(([name, seconds]) => ({ name, value: Math.round(seconds / 60) }))
    .slice(0, 5);

  return (
    <div className="rounded-3xl bg-white/5 border border-white/10 p-6 backdrop-blur shadow-glass">
      <p className="text-sm text-slate-300 mb-4">Top apps</p>
      <div className="h-56">
        <ResponsiveContainer>
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80}>
              {data.map((_entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #1e293b" }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className="text-xs text-slate-300 space-y-1">
        {data.map((item) => (
          <li key={item.name} className="flex justify-between">
            <span>{item.name}</span>
            <span>{item.value}m</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
