import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";

interface CategoryBreakdownProps {
  productive: number; // seconds
  neutral: number;
  distraction: number;
}

const tooltipStyle = {
  background: "rgba(3,8,20,0.8)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: "16px",
  color: "white",
  fontSize: "12px",
  padding: "8px 12px",
};

const categories = [
  { key: "productive", label: "Productive", color: "#58f0ff" },
  { key: "neutral", label: "Neutral", color: "#9c6bff" },
  { key: "distraction", label: "Distraction", color: "#ff8a8a" },
] as const;

export function CategoryBreakdown({ productive, neutral, distraction }: CategoryBreakdownProps) {
  const total = productive + neutral + distraction;

  const data = [
    { name: "Productive", value: Math.round(productive / 60), color: "#58f0ff" },
    { name: "Neutral", value: Math.round(neutral / 60), color: "#9c6bff" },
    { name: "Distraction", value: Math.round(distraction / 60), color: "#ff8a8a" },
  ].filter((d) => d.value > 0);

  if (total === 0) {
    return <p className="py-8 text-center text-sm text-white/40">No data yet</p>;
  }

  return (
    <div className="grid gap-4 md:grid-cols-[200px_1fr]">
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => `${v}m`} />
          <Pie data={data} dataKey="value" innerRadius={45} outerRadius={70} paddingAngle={2}>
            {data.map((entry) => (
              <Cell key={entry.name} fill={entry.color} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>

      <div className="space-y-3 text-sm text-white/70">
        {categories.map((cat) => {
          const seconds = cat.key === "productive" ? productive : cat.key === "neutral" ? neutral : distraction;
          const minutes = Math.round(seconds / 60);
          const pct = total > 0 ? Math.round((seconds / total) * 100) : 0;
          return (
            <div key={cat.key} className="flex items-center gap-3">
              <span className="h-3 w-3 rounded-full" style={{ background: cat.color }} />
              <p className="flex-1">{cat.label}</p>
              <p className="text-white">{minutes}m</p>
              <p className="w-10 text-right text-white/60">{pct}%</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
