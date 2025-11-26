import { Gauge, GaugeChart } from "./GaugeChart";

type Props = {
  score: number;
};

export function FocusMeter({ score }: Props) {
  return (
    <div className="rounded-3xl bg-white/5 border border-white/10 p-6 backdrop-blur shadow-glass">
      <p className="text-sm text-slate-300">Focus score</p>
      <GaugeChart score={score} />
      <p className="text-xs text-slate-400">Based on active vs idle minutes</p>
    </div>
  );
}
