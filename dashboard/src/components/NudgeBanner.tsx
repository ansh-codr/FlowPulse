import type { Nudge } from "../../../shared/types";

interface NudgeBannerProps {
  nudges: Nudge[];
  onDismiss: (id: string) => void;
}

const nudgeIcons: Record<string, string> = {
  break: "⏸️",
  refocus: "🎯",
  low_movement: "🚶",
  sleep_warning: "😴",
};

const nudgeColors: Record<string, string> = {
  break: "border-amber-400/30 bg-amber-400/10 text-amber-200",
  refocus: "border-ember/30 bg-ember/10 text-ember",
  low_movement: "border-neon/30 bg-neon/10 text-neon",
  sleep_warning: "border-aurora/30 bg-aurora/10 text-aurora",
};

export function NudgeBanner({ nudges, onDismiss }: NudgeBannerProps) {
  if (nudges.length === 0) return null;

  return (
    <div className="space-y-2">
      {nudges.map((nudge) => (
        <div
          key={nudge.id}
          className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-sm ${
            nudgeColors[nudge.type] ?? "border-white/10 bg-white/5 text-white"
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="text-lg">{nudgeIcons[nudge.type] ?? "💡"}</span>
            <p>{nudge.message}</p>
          </div>
          <button
            onClick={() => nudge.id && onDismiss(nudge.id)}
            className="ml-4 rounded-full px-2 py-1 text-xs text-white/60 hover:text-white"
          >
            Dismiss
          </button>
        </div>
      ))}
    </div>
  );
}
