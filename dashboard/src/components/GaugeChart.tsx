type GaugeProps = {
  score: number;
};

export function GaugeChart({ score }: GaugeProps) {
  const value = Math.max(0, Math.min(score ?? 0, 100));
  return (
    <div className="relative flex items-center justify-center h-40">
      <svg viewBox="0 0 200 100" className="w-full">
        <path
          d="M10 90 A80 80 0 0 1 190 90"
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="12"
          strokeLinecap="round"
        />
        <path
          d="M10 90 A80 80 0 0 1 190 90"
          fill="none"
          stroke="url(#gaugeGradient)"
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={`${(value / 100) * 251} 251`}
        />
        <defs>
          <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#22d3ee" />
            <stop offset="100%" stopColor="#a855f7" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute text-center">
        <p className="text-4xl font-semibold">{value}</p>
        <p className="text-xs uppercase tracking-wide text-white/60">score</p>
      </div>
    </div>
  );
}

export type { GaugeProps as Gauge };
