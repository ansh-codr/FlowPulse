import clsx from "clsx";
import { ActivityEvent } from "../state/useActivityStore";

type Props = {
  events: ActivityEvent[];
};

const hours = Array.from({ length: 24 }, (_, i) => i);

function bucketMinutes(events: ActivityEvent[]) {
  const bucket: Record<number, number> = {};
  for (const evt of events) {
    const hour = new Date(evt.ts).getHours();
    bucket[hour] = (bucket[hour] ?? 0) + (evt.is_idle ? 0 : evt.active_seconds / 60);
  }
  return bucket;
}

export function Heatmap({ events }: Props) {
  const bucket = bucketMinutes(events);
  const max = Math.max(...Object.values(bucket), 1);

  return (
    <div className="rounded-3xl bg-white/5 border border-white/10 p-6 backdrop-blur shadow-glass">
      <p className="text-sm text-slate-300 mb-4">Distraction heatmap</p>
      <div className="grid grid-cols-6 gap-2 text-xs">
        {hours.map((hour) => {
          const value = bucket[hour] ?? 0;
          const intensity = Math.min(1, value / max);
          return (
            <div
              key={hour}
              className={clsx(
                "h-10 rounded-xl flex flex-col justify-center items-center",
                intensity === 0
                  ? "bg-slate-800/50"
                  : "bg-gradient-to-br from-indigo-500/80 to-cyan-400/80"
              )}
            >
              <span>{hour.toString().padStart(2, "0")}:00</span>
              <span className="text-[10px] text-white/70">{value.toFixed(0)}m</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
