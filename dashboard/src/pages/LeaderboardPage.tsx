import { useEffect, useState } from "react";
import { GlassCard } from "../components/GlassCard";
import { getLeaderboard } from "../lib/firestoreQueries";
import { useAuth } from "../hooks/useAuth";
import type { LeaderboardEntry } from "../../../shared/types";

const rankColors: Record<number, string> = {
  1: "text-yellow-300",
  2: "text-gray-300",
  3: "text-amber-600",
};

export function LeaderboardPage() {
  const { user: _ } = useAuth();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLeaderboard()
      .then(setEntries)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl text-white">Leaderboard</h1>
        <p className="text-sm text-white/60">
          Weekly rankings • Anonymous nicknames • Resets every Sunday
        </p>
      </div>

      <GlassCard title="This Week" subtitle="Top performers">
        {loading ? (
          <p className="text-white/60">Loading rankings...</p>
        ) : entries.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-lg text-white/60">No rankings yet this week</p>
            <p className="mt-2 text-sm text-white/40">
              Rankings are computed every Sunday from daily focus scores.
              Keep tracking to appear on the board!
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {/* Header */}
            <div className="grid grid-cols-[60px_1fr_100px_100px_80px] gap-2 border-b border-white/10 pb-2 text-xs uppercase tracking-[0.3em] text-white/40">
              <span>Rank</span>
              <span>Player</span>
              <span className="text-right">Focus</span>
              <span className="text-right">Deep Blocks</span>
              <span className="text-right">%ile</span>
            </div>

            {entries.map((entry) => (
              <div
                key={entry.rank}
                className="grid grid-cols-[60px_1fr_100px_100px_80px] items-center gap-2 rounded-2xl border border-white/5 bg-white/5 px-4 py-3 text-sm"
              >
                <span
                  className={`font-display text-2xl font-bold ${
                    rankColors[entry.rank] ?? "text-white/60"
                  }`}
                >
                  #{entry.rank}
                </span>
                <span className="font-semibold text-white">
                  {entry.anonymousNickname}
                </span>
                <span className="text-right text-neon font-bold">
                  {entry.avgFocusScore.toFixed(0)}
                </span>
                <span className="text-right text-white/80">
                  {entry.deepWorkBlocks}
                </span>
                <span className="text-right">
                  <span className="rounded-full bg-aurora/20 px-2 py-0.5 text-xs text-aurora">
                    {entry.percentile}%
                  </span>
                </span>
              </div>
            ))}
          </div>
        )}
      </GlassCard>

      {/* Info card */}
      <GlassCard title="How it works" subtitle="Ranking algorithm">
        <div className="space-y-3 text-sm text-white/70">
          <p>
            Rankings are based on your <span className="text-neon">average daily focus score</span> over
            the past 7 days. Consistency matters — missing days count as zero.
          </p>
          <p>
            <span className="text-aurora">Deep work blocks</span> are periods of 25+ minutes
            of uninterrupted productive activity, boosting your ranking.
          </p>
          <p>
            All names are <span className="text-white">auto-generated anonymous nicknames</span> to
            keep things fun and private. No one can see your real identity.
          </p>
        </div>
      </GlassCard>
    </div>
  );
}
