import { motion, useMotionValueEvent, useSpring } from "framer-motion";
import { useEffect, useState } from "react";

interface StatTickerProps {
  value: number;
  label: string;
  prefix?: string;
  suffix?: string;
}

export function StatTicker({ value, label, prefix = "", suffix = "" }: StatTickerProps) {
  const spring = useSpring(0, { stiffness: 90, damping: 20 });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    spring.set(value);
  }, [value, spring]);

  useMotionValueEvent(spring, "change", (latest) => {
    setDisplay(Math.round(latest));
  });

  return (
    <div>
      <motion.p className="font-display text-4xl text-white" key={value}>
        {prefix}
        {display}
        {suffix}
      </motion.p>
      <p className="text-sm uppercase tracking-[0.3em] text-slate-300">{label}</p>
    </div>
  );
}
