import { motion } from "framer-motion";

interface FocusRingProps {
  value: number;
}

export function FocusRing({ value }: FocusRingProps) {
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const progress = (value / 100) * circumference;

  return (
    <div className="relative flex h-40 w-40 items-center justify-center">
      <svg className="h-full w-full -rotate-90" viewBox="0 0 160 160">
        <circle
          cx="80"
          cy="80"
          r={radius}
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="12"
          fill="transparent"
        />
        <motion.circle
          cx="80"
          cy="80"
          r={radius}
          stroke="url(#focusGradient)"
          strokeWidth="12"
          strokeLinecap="round"
          fill="transparent"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - progress }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          style={{ strokeDasharray: `${circumference}` }}
        />
        <defs>
          <linearGradient id="focusGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#58f0ff" />
            <stop offset="100%" stopColor="#9c6bff" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute text-center">
        <p className="text-4xl font-bold text-white">{value}%</p>
        <p className="text-xs uppercase tracking-widest text-white/60">Focus</p>
      </div>
    </div>
  );
}
