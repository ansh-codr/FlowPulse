import { motion, useMotionValueEvent, useSpring } from "framer-motion";
import { useEffect, useState } from "react";

interface StatTickerProps {
  value: number;
  label: string;
  prefix?: string;
  suffix?: string;
  accentColor?: string;
}

export function StatTicker({
  value,
  label,
  prefix = "",
  suffix = "",
  accentColor = "#58f0ff",
}: StatTickerProps) {
  const spring = useSpring(0, { stiffness: 90, damping: 20 });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    spring.set(value);
  }, [value, spring]);

  useMotionValueEvent(spring, "change", (latest) => {
    setDisplay(Math.round(latest));
  });

  return (
    <div className="group flex flex-col gap-1">
      <motion.p
        className="font-display text-3xl font-bold leading-none text-white"
        key={value}
      >
        <span className="text-white/30">{prefix}</span>
        <span style={{ color: accentColor }}>{display}</span>
        <span className="text-lg text-white/50">{suffix}</span>
      </motion.p>
      <p className="text-[10px] font-medium uppercase tracking-[0.3em] text-white/40">{label}</p>
    </div>
  );
}
