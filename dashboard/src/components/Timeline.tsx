import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ActivityEvent } from "../state/useActivityStore";

type Props = {
  events: ActivityEvent[];
};

export function Timeline({ events }: Props) {
  const data = [...events]
    .sort((a, b) => (a.ts > b.ts ? 1 : -1))
    .map((evt) => ({
      time: new Date(evt.ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      active: evt.is_idle ? 0 : evt.active_seconds,
      idle: evt.is_idle ? evt.active_seconds : 0,
    }));

  return (
    <div className="rounded-3xl bg-white/5 border border-white/10 p-6 backdrop-blur shadow-glass">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-slate-300">Focus timeline</p>
        <span className="text-xs text-slate-400">Last 3h</span>
      </div>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="activeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="idleGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f97316" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="time" stroke="#94a3b8" fontSize={10} />
            <YAxis stroke="#94a3b8" fontSize={10} hide />
            <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #1e293b" }} />
            <Area type="monotone" dataKey="active" stroke="#22d3ee" fill="url(#activeGradient)" />
            <Area type="monotone" dataKey="idle" stroke="#f97316" fill="url(#idleGradient)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
