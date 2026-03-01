import type { HeatmapCell } from "../../../shared/types";

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function HeatmapGrid({ data }: { data: HeatmapCell[] }) {
  return (
    <div className="overflow-x-auto">
      <div className="min-w-[640px]">
        <div className="mb-2 grid grid-cols-[60px_repeat(24,minmax(16px,1fr))] gap-1 text-xs uppercase tracking-[0.3em] text-white/40">
          <span />
          {Array.from({ length: 24 }, (_, hour) => (
            <span key={hour} className="text-center">
              {hour % 3 === 0 ? `${hour}` : ""}
            </span>
          ))}
        </div>
        {days.map((day, dayIdx) => (
          <div
            key={day}
            className="mb-1 grid grid-cols-[60px_repeat(24,minmax(16px,1fr))] gap-1 text-xs text-white/70"
          >
            <span className="text-white/60">{day}</span>
            {Array.from({ length: 24 }, (_, hour) => {
              const cell = data.find((c) => c.day === dayIdx && c.hour === hour);
              const intensity = cell ? cell.intensity : 0;
              return (
                <span
                  key={`${day}-${hour}`}
                  className="h-5 rounded-md"
                  style={{
                    background: `linear-gradient(135deg, rgba(88,240,255,${0.2 + intensity * 0.5}), rgba(156,107,255,${intensity}))`,
                    boxShadow: intensity > 0.65 ? "0 0 12px rgba(156,107,255,0.4)" : "none",
                  }}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
