import { motion, useSpring, useMotionValueEvent } from "framer-motion";
import { useEffect, useState } from "react";

interface KpiCardProps {
  label: string;
  value: string;
  caption?: string;
  accentColor?: string;
  icon?: React.ReactNode;
  trend?: "up" | "down" | "neutral";
}

export function KpiCard({
  label,
  value,
  caption,
  accentColor = "#58f0ff",
  icon,
  trend = "neutral",
}: KpiCardProps) {
  const numericValue = parseFloat(value.replace(/[^0-9.]/g, "")) || 0;
  const suffix = value.replace(/[0-9.]/g, "");
  const spring = useSpring(0, { stiffness: 60, damping: 18 });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    spring.set(numericValue);
  }, [numericValue, spring]);

  useMotionValueEvent(spring, "change", (latest) => {
    setDisplay(Math.round(latest));
  });

  const trendArrow =
    trend === "up" ? "↑" : trend === "down" ? "↓" : "";
  const trendColor =
    trend === "up" ? "#4ade80" : trend === "down" ? "#ff8a8a" : "transparent";

  return (
    <motion.div
      className="relative overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.04] p-4 shadow-card backdrop-blur-xl"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={{ y: -2, transition: { duration: 0.15 } }}
    >
      {/* Top accent line */}
      <div
        className="absolute left-0 right-0 top-0 h-[2px] rounded-t-2xl"
        style={{ background: `linear-gradient(90deg, ${accentColor}cc, ${accentColor}40, transparent)` }}
      />

      {/* Inner glow */}
      <div
        className="pointer-events-none absolute left-0 top-0 h-20 w-full"
        style={{
          background: `radial-gradient(ellipse at top left, ${accentColor}0a, transparent 60%)`,
        }}
      />

      <div className="relative flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.35em] text-white/40">{label}</p>
          <p
            className="font-display text-3xl font-bold leading-none"
            style={{ color: accentColor }}
          >
            {display}{suffix}
          </p>
          {caption && (
            <p className="mt-2 text-xs text-white/40">{caption}</p>
          )}
        </div>
        <div className="flex flex-col items-end gap-1">
          {icon && <div style={{ color: accentColor }} className="opacity-60">{icon}</div>}
          {trendArrow && (
            <span className="text-sm font-bold" style={{ color: trendColor }}>
              {trendArrow}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
