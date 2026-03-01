import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { GlassCard } from "../components/GlassCard";
import { getLeaderboard } from "../lib/firestoreQueries";
import type { LeaderboardEntry } from "../../../shared/types";

const podiumConfig = [
  { rank: 1, color: "#f5c842", shadow: "rgba(245,200,66,0.4)", label: "Gold", height: "h-24" },
  { rank: 2, color: "#a0aec0", shadow: "rgba(160,174,192,0.4)", label: "Silver", height: "h-16" },
  { rank: 3, color: "#b7791f", shadow: "rgba(183,121,31,0.4)", label: "Bronze", height: "h-12" },
];

const rankGlow: Record<number, string> = {
  1: "shadow-glow-gold",
  2: "",
  3: "",
};

export function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLeaderboard().then(setEntries).finally(() => setLoading(false));
  }, []);

  const top3 = entries.slice(0, 3);

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <p className="text-xs uppercase tracking-[0.4em] text-white/30">Community Rankings</p>
        <h1 className="font-display text-4xl font-bold tracking-tight text-white">Leaderboard</h1>
        <p className="text-sm text-white/40">Weekly rankings · Anonymous · Resets every Sunday</p>
      </div>

      {/* Podium — top 3 */}
      {!loading && top3.length >= 3 && (
        <motion.div
          className="flex items-end justify-center gap-4 pb-2 pt-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Reorder: 2nd, 1st, 3rd */}
          {[top3[1], top3[0], top3[2]].map((entry, idx) => {
            const cfg = podiumConfig[entry.rank - 1];
            return (
              <motion.div
                key={entry.rank}
                className="flex flex-1 max-w-[160px] flex-col items-center gap-2"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1, duration: 0.5 }}
              >
                <p className="font-display text-sm font-semibold text-white/70">{entry.anonymousNickname}</p>
                <p className="font-display text-xl font-bold" style={{ color: cfg.color }}>
                  {entry.avgFocusScore.toFixed(0)}
                </p>
                <div
                  className={`flex w-full items-center justify-center rounded-t-xl font-display text-2xl font-bold ${cfg.height} ${rankGlow[entry.rank]}`}
                  style={{
                    background: `linear-gradient(180deg, ${cfg.color}30, ${cfg.color}10)`,
                    border: `1px solid ${cfg.color}40`,
                    color: cfg.color,
                    textShadow: `0 0 20px ${cfg.shadow}`,
                  }}
                >
                  {entry.rank === 1 ? "🥇" : entry.rank === 2 ? "🥈" : "🥉"}
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      <GlassCard title="This Week" subtitle="Top performers" accentColor="#f5c842">
        {loading ? (
          <div className="flex h-32 items-center justify-center">
            <p className="text-xs uppercase tracking-[0.4em] text-white/30">Loading rankings…</p>
          </div>
        ) : entries.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-lg font-semibold text-white/40">No rankings yet</p>
            <p className="mt-2 text-sm text-white/25">Keep tracking to appear on the board!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {/* Header */}
            <div className="grid grid-cols-[56px_1fr_80px_90px_70px] gap-2 border-b border-white/[0.06] pb-2.5 text-[10px] uppercase tracking-[0.3em] text-white/30">
              <span>Rank</span><span>Player</span><span className="text-right">Focus</span>
              <span className="text-right">Deep Blks</span><span className="text-right">%ile</span>
            </div>

            {entries.map((entry, i) => {
              const rankColor =
                entry.rank === 1 ? "#f5c842" :
                  entry.rank === 2 ? "#a0aec0" :
                    entry.rank === 3 ? "#b7791f" : "rgba(255,255,255,0.4)";
              return (
                <motion.div
                  key={entry.rank}
                  className="grid grid-cols-[56px_1fr_80px_90px_70px] items-center gap-2 rounded-xl border border-white/[0.05] bg-white/[0.03] px-3 py-3 text-sm"
                  style={entry.rank <= 3 ? { borderLeft: `2px solid ${rankColor}` } : {}}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <span className="font-display text-xl font-bold" style={{ color: rankColor }}>
                    #{entry.rank}
                  </span>
                  <span className="font-semibold text-white">{entry.anonymousNickname}</span>
                  <span className="text-right font-bold text-neon">{entry.avgFocusScore.toFixed(0)}</span>
                  <span className="text-right text-white/70">{entry.deepWorkBlocks}</span>
                  <span className="text-right">
                    <span className="rounded-full bg-aurora/15 px-2 py-0.5 text-xs text-aurora">
                      {entry.percentile}%
                    </span>
                  </span>
                </motion.div>
              );
            })}
          </div>
        )}
      </GlassCard>

      <GlassCard title="How it works" subtitle="Ranking algorithm" accentColor="#9c6bff" delay={0.1}>
        <div className="space-y-3 text-sm leading-relaxed text-white/50">
          <p>Rankings use your <span className="text-neon font-medium">average daily focus score</span> over the past 7 days. Missing days count as zero.</p>
          <p><span className="text-aurora font-medium">Deep work blocks</span> are 25+ min uninterrupted productive sessions — they boost your ranking significantly.</p>
          <p>All names are <span className="text-white/80 font-medium">auto-generated anonymous nicknames</span>. No one can identify you.</p>
        </div>
      </GlassCard>
    </div>
  );
}
