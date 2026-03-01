import { motion } from "framer-motion";

interface FocusRingProps {
  value: number;
}

export function FocusRing({ value }: FocusRingProps) {
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const progress = (value / 100) * circumference;

  const scoreColor =
    value >= 75 ? "#58f0ff" : value >= 50 ? "#9c6bff" : "#ff8a8a";

  return (
    <div className="relative flex h-52 w-52 items-center justify-center">
      {/* Outer ambient glow ring */}
      <div
        className="absolute inset-0 animate-pulse-glow rounded-full opacity-30"
        style={{
          background: `radial-gradient(circle, ${scoreColor}22 0%, transparent 70%)`,
          filter: "blur(12px)",
        }}
      />

      <svg className="h-full w-full -rotate-90" viewBox="0 0 180 180">
        <defs>
          <linearGradient id="focusGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#58f0ff" />
            <stop offset="50%" stopColor="#9c6bff" />
            <stop offset="100%" stopColor="#6d6dff" />
          </linearGradient>
          <filter id="ring-glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Track */}
        <circle
          cx="90"
          cy="90"
          r={radius}
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="10"
          fill="transparent"
        />

        {/* Progress */}
        <motion.circle
          cx="90"
          cy="90"
          r={radius}
          stroke="url(#focusGradient)"
          strokeWidth="10"
          strokeLinecap="round"
          fill="transparent"
          filter="url(#ring-glow)"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - progress }}
          transition={{ duration: 1.4, ease: [0.25, 0.46, 0.45, 0.94] }}
          style={{ strokeDasharray: `${circumference}` }}
        />
      </svg>

      {/* Center content */}
      <div className="absolute text-center">
        <motion.p
          className="font-display text-5xl font-bold leading-none"
          style={{
            background: `linear-gradient(135deg, #58f0ff, #9c6bff)`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            filter: "drop-shadow(0 0 12px rgba(88,240,255,0.4))",
          }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          {value}
        </motion.p>
        <p className="mt-1 text-[10px] uppercase tracking-widest text-white/40">Focus Score</p>
      </div>
    </div>
  );
}
