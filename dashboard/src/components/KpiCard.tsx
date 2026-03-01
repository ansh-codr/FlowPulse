interface KpiCardProps {
  label: string;
  value: string;
  caption?: string;
}

export function KpiCard({ label, value, caption }: KpiCardProps) {
  return (
    <div className="rounded-2xl border border-white/5 bg-white/5 p-4 text-white/80">
      <p className="text-xs uppercase tracking-[0.35em] text-white/40">{label}</p>
      <p className="font-display text-3xl text-white">{value}</p>
      {caption && <p className="text-xs text-white/60">{caption}</p>}
    </div>
  );
}
