/**
 * Home.tsx — FlowPulse Dashboard
 * All data is fetched from Firestore + Google Cloud Health (via Firebase Functions).
 * No mock data. Every widget is live.
 */
import { useEffect, useMemo, useState } from "react";
import { motion, type Variants } from "framer-motion";
import { Link } from "react-router-dom";
import { GlassCard } from "../components/GlassCard";
import { FocusRing } from "../components/FocusRing";
import { StatTicker } from "../components/StatTicker";
import { KpiCard } from "../components/KpiCard";
import { ActiveBar, FocusTimeline, MiniPie } from "../components/charts";
import { useDashboardData } from "../hooks/useDashboardData";
import { useAuth } from "../hooks/useAuth";
import {
  getMobileActivitySummaries,
  getWeeklyCombinedAnalytics,
  subscribeToHealthAlerts,
  dismissHealthAlert,
} from "../lib/firestoreQueries";
import type {
  MobileActivitySummary,
  CombinedAnalyticsDaily,
  HealthAlert,
} from "../../../shared/types";

/* ── Animation variants ─────────────────────────────────────────────────── */
const container: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};
const item: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] } },
};

/* ── Helpers ────────────────────────────────────────────────────────────── */
function toIsoDate(d: Date) { return d.toISOString().slice(0, 10); }
function fmtMin(min: number) {
  if (min < 60) return `${min}m`;
  return `${Math.floor(min / 60)}h ${min % 60}m`;
}
function formatTime(isoString: string) {
  const d = new Date(isoString);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

/* ── Profile card ───────────────────────────────────────────────────────── */
function ProfileCard({ focusScore, streakDays }: { focusScore: number; streakDays: number }) {
  const { user, updateAvatar } = useAuth();
  const [hovered, setHovered] = useState(false);

  const handleAvatarChange = () => {
    const url = prompt("Paste a new image URL for your avatar:", user?.photoURL ?? "");
    if (url?.trim()) updateAvatar(url.trim());
  };

  if (!user) return null;

  const scoreColor = focusScore >= 75 ? "#58f0ff" : focusScore >= 50 ? "#9c6bff" : "#ff8a8a";

  return (
    <motion.div
      variants={item}
      className="relative overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.03] backdrop-blur-md shadow-xl"
    >
      {/* Ambient glow */}
      <div className="pointer-events-none absolute -top-10 -right-10 h-32 w-32 rounded-full blur-[50px]" style={{ background: `${scoreColor}22` }} />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/[0.06] to-transparent" />

      <div className="relative flex flex-col items-center px-6 pt-8 pb-6 gap-4">
        {/* Avatar */}
        <div
          className="relative h-24 w-24 cursor-pointer rounded-2xl overflow-hidden ring-2 ring-white/10 hover:ring-white/30 transition-all shadow-xl group"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          onClick={handleAvatarChange}
        >
          {user.photoURL ? (
            <img src={user.photoURL} alt="Avatar" className="h-full w-full object-cover group-hover:scale-110 transition duration-300" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-white/[0.06] text-3xl font-bold text-white/50">
              {(user.displayName ?? user.email ?? "U")[0].toUpperCase()}
            </div>
          )}
          <div className={`absolute inset-0 bg-black/60 flex items-center justify-center transition-opacity ${hovered ? "opacity-100" : "opacity-0"}`}>
            <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold text-white/90 backdrop-blur-sm">
              Change
            </span>
          </div>
        </div>

        {/* User info */}
        <div className="text-center">
          <p className="text-base font-semibold text-white">{user.displayName ?? "User"}</p>
          <p className="mt-0.5 text-xs text-white/40 truncate max-w-[200px]">{user.email}</p>
        </div>

        {/* Stats row */}
        <div className="flex w-full items-center divide-x divide-white/10 rounded-2xl border border-white/10 bg-white/[0.04]">
          <div className="flex flex-1 flex-col items-center py-3">
            <p className="text-xl font-bold" style={{ color: scoreColor }}>{focusScore}</p>
            <p className="mt-0.5 text-[10px] uppercase tracking-widest text-white/40">Focus</p>
          </div>
          <div className="flex flex-1 flex-col items-center py-3">
            <p className="text-xl font-bold text-[#f5c842]">{streakDays}</p>
            <p className="mt-0.5 text-[10px] uppercase tracking-widest text-white/40">Day Streak</p>
          </div>
        </div>

        {/* Quick nav links */}
        <div className="w-full space-y-1 pt-2">
          {[
            { label: "Timeline", to: "/app/timeline" },
            { label: "Heatmap", to: "/app/heatmap" },
            { label: "Sessions", to: "/app/sessions" },
            { label: "Top Apps", to: "/app/top-apps" },
            { label: "Leaderboard", to: "/app/leaderboard" },
            { label: "Settings", to: "/app/settings" },
          ].map(({ label, to }) => (
            <Link
              key={to}
              to={to}
              className="flex items-center justify-between rounded-xl px-4 py-2.5 text-sm font-medium text-white/70 hover:bg-white/[0.06] hover:text-white transition group"
            >
              <span>{label}</span>
              <svg className="h-3.5 w-3.5 text-white/30 group-hover:text-white/70 transition" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </Link>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

/* ── Weekly focus bar chart ─────────────────────────────────────────────── */
function WeeklyFocusChart({ timeline }: { timeline: ReturnType<typeof import("../hooks/useDashboardData").logsToTimeline> }) {
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const blockMap = new Map(timeline.map(b => [parseInt(b.hour), b]));
  const maxScore = Math.max(...timeline.map(b => b.focusScore), 1);

  if (timeline.length === 0) {
    return (
      <div className="flex h-28 items-center justify-center text-sm text-white/30">
        No activity data today
      </div>
    );
  }

  return (
    <div className="flex h-28 items-end gap-1 w-full px-1">
      {hours.map(h => {
        const block = blockMap.get(h);
        const heightPct = block ? Math.max(4, (block.focusScore / maxScore) * 100) : 0;
        const color = block
          ? block.focusScore >= 75 ? "#58f0ff" : block.focusScore >= 50 ? "#9c6bff" : "#ff8a8a"
          : "transparent";
        const isNow = new Date().getHours() === h;
        return (
          <div key={h} className="flex flex-1 flex-col items-center gap-1 group relative">
            {block && (
              <div className="absolute -top-7 left-1/2 -translate-x-1/2 hidden group-hover:flex flex-col items-center z-10">
                <div className="rounded-lg bg-black/80 border border-white/10 px-2 py-1 text-[10px] text-white whitespace-nowrap">
                  {block.hour}: {block.focusScore}pts · {block.activeMinutes}m
                </div>
              </div>
            )}
            <div
              className={`w-full rounded-full transition-all duration-300 ${isNow ? "ring-1 ring-white/40" : ""}`}
              style={{
                height: `${heightPct}%`,
                background: block ? `linear-gradient(to top, ${color}99, ${color})` : "transparent",
                minHeight: block ? "4px" : 0,
              }}
            />
            {h % 6 === 0 && (
              <span className="text-[8px] text-white/20">{h}h</span>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ── Activity log list ──────────────────────────────────────────────────── */
function ActivityFeed({ logs }: { logs: ReturnType<typeof import("../hooks/useDashboardData").logsToEvents> }) {
  const recentLogs = logs.slice(0, 8);

  if (recentLogs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-sm text-white/30 gap-2">
        <svg className="h-8 w-8 text-white/20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
          <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        No activity logged yet today
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {recentLogs.map(ev => {
        const catColor = ev.category === "productive" ? "#58f0ff" : ev.category === "neutral" ? "#9c6bff" : "#ff8a8a";
        return (
          <div key={ev.id} className="group flex items-center gap-3 rounded-xl border border-white/[0.04] bg-white/[0.02] px-3 py-2.5 hover:border-white/10 hover:bg-white/[0.04] transition">
            <div className="h-2 w-2 flex-shrink-0 rounded-full" style={{ background: catColor, boxShadow: `0 0 6px ${catColor}` }} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white/90 truncate">{ev.title}</p>
              <p className="text-[10px] text-white/40">{ev.url.replace(/^https?:\/\//, "").split("/")[0]}</p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-[10px] text-white/40">{formatTime(ev.start)}</p>
              <p className="text-[10px] capitalize" style={{ color: catColor }}>{ev.category}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ── Health alerts panel ────────────────────────────────────────────────── */
function HealthAlertsPanel({ uid }: { uid: string }) {
  const [alerts, setAlerts] = useState<HealthAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) { setLoading(false); return; }
    setLoading(true);
    const unsub = subscribeToHealthAlerts(uid, (a) => {
      setAlerts(a);
      setLoading(false);
    });
    return unsub;
  }, [uid]);

  const handleDismiss = async (alertId: string) => {
    await dismissHealthAlert(uid, alertId);
  };

  const priorityColor = (p: string) =>
    p === "high" ? "#ff8a8a" : p === "medium" ? "#f5c842" : "#6ef5b1";

  if (loading) return <p className="text-sm text-white/30 py-4">Loading health alerts…</p>;

  if (alerts.length === 0) {
    return (
      <div className="flex flex-col items-center py-6 text-sm text-white/30 gap-2">
        <svg className="h-8 w-8 text-white/20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        All clear — no active health alerts
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {alerts.slice(0, 5).map(alert => (
        <div key={alert.id} className="group flex items-start gap-3 rounded-xl border border-white/[0.06] bg-white/[0.03] px-3 py-3 hover:border-white/10 transition">
          <div className="mt-0.5 h-2 w-2 flex-shrink-0 rounded-full" style={{ background: priorityColor(alert.priority), boxShadow: `0 0 5px ${priorityColor(alert.priority)}` }} />
          <div className="flex-1 min-w-0">
            <p className="text-sm text-white/80 leading-snug">{alert.message}</p>
            <p className="mt-1 text-[10px] uppercase tracking-wider" style={{ color: priorityColor(alert.priority) }}>{alert.priority} priority</p>
          </div>
          <button
            onClick={() => alert.id && handleDismiss(alert.id)}
            className="mt-0.5 flex-shrink-0 rounded-lg p-1 text-white/20 opacity-0 group-hover:opacity-100 hover:bg-white/[0.06] hover:text-white/60 transition"
            title="Dismiss"
          >
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
}

/* ── Google Health / Mobile Activity ────────────────────────────────────── */
function MobileHealthPanel() {
  const [summaries, setSummaries] = useState<MobileActivitySummary[]>([]);
  const [combined, setCombined] = useState<CombinedAnalyticsDaily | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.uid) { setLoading(false); return; }
    setLoading(true);
    Promise.all([
      getMobileActivitySummaries(7),
      getWeeklyCombinedAnalytics(user.uid),
    ]).then(([sums, combArr]) => {
      setSummaries(sums);
      setCombined(combArr[0] ?? null);
    }).finally(() => setLoading(false));
  }, [user?.uid]);

  const today = useMemo(() => {
    const todayStr = toIsoDate(new Date());
    return summaries.find(s => s.date === todayStr) ?? summaries[0] ?? null;
  }, [summaries]);

  if (loading) return <p className="text-sm text-white/30">Syncing Google Health data…</p>;

  if (!today) {
    return (
      <div className="flex flex-col gap-3 py-4">
        <p className="text-sm text-white/50">No Google Health data synced yet.</p>
        <p className="text-xs text-white/30 leading-relaxed">
          Connect your Android phone's Health Connect data from the Settings page to see steps, active minutes, and wellness insights here.
        </p>
        <Link
          to="/app/settings"
          className="inline-flex w-fit items-center gap-2 rounded-xl border border-neon/30 bg-neon/10 px-4 py-2 text-xs font-semibold text-neon hover:bg-neon/20 transition"
        >
          Connect Health Data →
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <div className="flex flex-col items-center rounded-xl border border-white/[0.06] bg-white/[0.03] py-3 gap-1">
          <p className="text-2xl font-bold text-[#6ef5b1]">{today.step_count.toLocaleString()}</p>
          <p className="text-[10px] uppercase tracking-widest text-white/40">Steps</p>
        </div>
        <div className="flex flex-col items-center rounded-xl border border-white/[0.06] bg-white/[0.03] py-3 gap-1">
          <p className="text-2xl font-bold text-[#58f0ff]">{today.active_minutes}</p>
          <p className="text-[10px] uppercase tracking-widest text-white/40">Active Min</p>
        </div>
        <div className="flex flex-col items-center rounded-xl border border-white/[0.06] bg-white/[0.03] py-3 gap-1">
          <p className="text-2xl font-bold text-[#f5c842]">{today.activity_sessions}</p>
          <p className="text-[10px] uppercase tracking-widest text-white/40">Sessions</p>
        </div>
      </div>

      {combined && (
        <div className="flex flex-wrap gap-2">
          <span className={`rounded-full px-2.5 py-1 text-xs ${combined.highScreenUsageLowPhysicalActivity ? "bg-rose-500/20 text-rose-300" : "bg-emerald-500/10 text-emerald-400"}`}>
            {combined.highScreenUsageLowPhysicalActivity ? "⚠ High screen, low movement" : "✓ Screen/movement balanced"}
          </span>
          <span className={`rounded-full px-2.5 py-1 text-xs ${combined.longSedentaryStudyDetected ? "bg-amber-500/20 text-amber-300" : "bg-emerald-500/10 text-emerald-400"}`}>
            {combined.longSedentaryStudyDetected ? "⚠ Long study, no breaks" : "✓ Break rhythm healthy"}
          </span>
          <span className={`rounded-full px-2.5 py-1 text-xs ${combined.healthyLearningMovementBalance ? "bg-emerald-500/20 text-emerald-300" : "bg-white/10 text-white/50"}`}>
            {combined.healthyLearningMovementBalance ? "✓ Healthy balance" : "Balance building…"}
          </span>
        </div>
      )}

      {summaries.length > 1 && (
        <div className="mt-3">
          <p className="text-[10px] uppercase tracking-widest text-white/30 mb-2">7-Day Steps</p>
          <div className="flex h-12 items-end gap-1">
            {summaries.slice(0, 7).reverse().map((s, i) => {
              const maxSteps = Math.max(...summaries.map(x => x.step_count), 1);
              const h = Math.max(4, (s.step_count / maxSteps) * 100);
              return (
                <div key={i} className="group relative flex flex-1 flex-col items-center justify-end">
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 hidden group-hover:block rounded bg-black/80 px-1.5 py-0.5 text-[9px] text-white whitespace-nowrap">
                    {s.step_count.toLocaleString()}
                  </div>
                  <div
                    className="w-full rounded-t-sm"
                    style={{ height: `${h}%`, background: "linear-gradient(to top, #6ef5b199, #6ef5b1)" }}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
 * Main HomePage
 * ══════════════════════════════════════════════════════════════════════════ */
export function HomePage() {
  const { user } = useAuth();
  const {
    overview,
    timeline,
    sessions,
    attention,
    distractions,
    apps,
    events,
    kpis,
    loading,
    hasData,
  } = useDashboardData();

  if (loading) {
    return (
      <div className="flex h-72 items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative h-12 w-12">
            <div className="absolute inset-0 rounded-full border-2 border-neon/20" />
            <div className="absolute inset-0 animate-spin rounded-full border-t-2 border-neon" />
          </div>
          <p className="text-xs uppercase tracking-[0.4em] text-white/30">Loading FlowPulse…</p>
        </div>
      </div>
    );
  }

  if (!hasData) {
    return (
      <motion.div
        className="flex flex-col items-center justify-center gap-8 py-24"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="relative h-20 w-20">
          <div className="absolute inset-0 rounded-full border-2 border-neon/10" />
          <div className="absolute inset-2 animate-spin rounded-full border-2 border-dashed border-neon/20" style={{ animationDuration: "12s" }} />
          <div className="absolute inset-0 flex items-center justify-center text-neon/60">
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white">No Focus Data Yet</h2>
          <p className="mt-2 text-sm text-white/40 max-w-md">
            Install the FlowPulse Chrome Extension and browse normally — your activity will appear here in real time.
          </p>
          <Link
            to="/extension"
            className="mt-6 inline-flex items-center gap-2 rounded-xl border border-neon/30 bg-neon/10 px-5 py-2.5 text-sm font-semibold text-neon hover:bg-neon/20 transition"
          >
            Download Extension
          </Link>
        </div>
      </motion.div>
    );
  }

  const name = user?.displayName?.split(" ")[0] ?? "Agent";
  const kpiAccents = ["#58f0ff", "#9c6bff", "#f5c842", "#6ef5b1"];

  return (
    <motion.div className="w-full space-y-6 pb-10" variants={container} initial="hidden" animate="show">

      {/* ── Greeting header ──────────────────────────────────── */}
      <motion.div variants={item} className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Hey, {name} 👋
          </h1>
          <p className="mt-1 text-sm text-white/40">
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })} · Live dashboard
          </p>
        </div>
        <div className="flex items-center gap-2 mt-3 sm:mt-0">
          <span className="flex items-center gap-1.5 rounded-full border border-neon/20 bg-neon/5 px-3 py-1.5 text-xs font-medium text-neon">
            <span className="h-1.5 w-1.5 rounded-full bg-neon animate-pulse" />
            Live tracking
          </span>
          {overview.streakDays > 0 && (
            <span className="flex items-center gap-1.5 rounded-full border border-[#f5c842]/20 bg-[#f5c842]/5 px-3 py-1.5 text-xs font-medium text-[#f5c842]">
              🔥 {overview.streakDays}-day streak
            </span>
          )}
        </div>
      </motion.div>

      {/* ── KPI Strip ────────────────────────────────────────── */}
      <motion.div variants={item} className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <KpiCard
          label="Focus Score"
          value={`${overview.focusScore}`}
          caption="today"
          accentColor={kpiAccents[0]}
          trend={overview.focusScore >= 65 ? "up" : overview.focusScore >= 40 ? "neutral" : "down"}
        />
        <KpiCard
          label="Active Time"
          value={`${fmtMin(overview.totalActiveMinutes)}`}
          caption="total today"
          accentColor={kpiAccents[1]}
        />
        <KpiCard
          label="Context Switches"
          value={`${kpis.contextSwitches}`}
          caption="domain hops"
          accentColor={kpiAccents[2]}
          trend={kpis.contextSwitches > 20 ? "down" : "neutral"}
        />
        <KpiCard
          label="Deep Blocks"
          value={`${kpis.shippedArtifacts}`}
          caption={`Longest: ${kpis.longestSession}m`}
          accentColor={kpiAccents[3]}
          trend={kpis.shippedArtifacts > 0 ? "up" : "neutral"}
        />
      </motion.div>

      {/* ── Main Bento Grid ──────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr_300px] xl:grid-cols-[300px_1fr_320px]">

        {/* Left column — Profile + Quick nav */}
        <div className="flex flex-col gap-6">
          <ProfileCard focusScore={overview.focusScore} streakDays={overview.streakDays} />
        </div>

        {/* Centre column — Focus ring + hourly chart + activity feed */}
        <div className="flex flex-col gap-6">
          {/* Focus ring + timeline */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <GlassCard
              title="Focus Score"
              subtitle="Live orbital ring"
              corner={<span className="rounded-full bg-neon/10 px-2 py-0.5 text-[10px] font-medium text-neon">AI</span>}
              accentColor="#58f0ff"
            >
              <div className="flex flex-col items-center gap-4 py-2">
                <FocusRing value={overview.focusScore} />
                <div className="grid w-full grid-cols-3 gap-3 border-t border-white/[0.06] pt-3">
                  <StatTicker value={overview.totalActiveMinutes} label="Active" suffix="m" accentColor="#58f0ff" />
                  <StatTicker value={overview.distractionCount} label="Distracts" accentColor="#ff8a8a" />
                  <StatTicker value={sessions.length} label="Sessions" accentColor="#9c6bff" />
                </div>
              </div>
            </GlassCard>

            <GlassCard
              title="Hourly Activity"
              subtitle="Focus intensity today"
              accentColor="#9c6bff"
            >
              <p className="text-[10px] text-white/30 mb-3">
                Peak: {kpis.deepestBlock !== "—" ? kpis.deepestBlock : "No deep blocks yet"}
              </p>
              <WeeklyFocusChart timeline={timeline} />
              <div className="mt-3 border-t border-white/[0.06] pt-3">
                <ActiveBar data={timeline} />
              </div>
            </GlassCard>
          </div>

          {/* Attention split + Distraction radar */}
          {attention.length > 0 && (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <GlassCard title="Attention Split" subtitle="How your time was spent" accentColor="#58f0ff">
                <div className="grid gap-4 md:grid-cols-[1fr_140px]">
                  <div className="flex flex-col justify-center gap-3">
                    {attention.map(s => (
                      <div key={s.label} className="flex items-center gap-3">
                        <div className="flex-1">
                          <div className="flex justify-between mb-1">
                            <span className="text-xs text-white/60">{s.label}</span>
                            <span className="text-xs font-bold text-white">{s.value}%</span>
                          </div>
                          <div className="h-1.5 w-full rounded-full bg-white/10">
                            <div className="h-full rounded-full" style={{ width: `${s.value}%`, background: s.color }} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <MiniPie data={attention} />
                </div>
              </GlassCard>

              {distractions.length > 0 && (
                <GlassCard title="Distraction Sources" subtitle="Top time-stealers" accentColor="#ff8a8a">
                  <div className="space-y-2">
                    {distractions.slice(0, 4).map(s => (
                      <div key={s.label} className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full flex-shrink-0" style={{ background: s.color }} />
                        <span className="flex-1 text-xs text-white/70 truncate">{s.label}</span>
                        <span className="text-xs font-semibold text-white">{s.value}%</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 pt-3 border-t border-white/[0.06]">
                    <MiniPie data={distractions} />
                  </div>
                </GlassCard>
              )}
            </div>
          )}

          {/* Activity feed */}
          <GlassCard
            title="Activity Log"
            subtitle={`${events.length} events tracked today`}
            accentColor="#6ef5b1"
            corner={
              <Link to="/app/timeline" className="text-[10px] text-white/40 hover:text-white transition">
                See timeline →
              </Link>
            }
          >
            <ActivityFeed logs={events} />
          </GlassCard>
        </div>

        {/* Right column — Top apps, Health alerts, Google Health */}
        <div className="flex flex-col gap-6">
          {/* Top apps */}
          {apps.length > 0 && (
            <GlassCard title="Top Apps" subtitle="By time spent today" accentColor="#f5c842">
              <div className="space-y-2">
                {apps.slice(0, 6).map((app, i) => {
                  const maxMin = apps[0].minutes;
                  return (
                    <div key={app.name} className="flex items-center gap-2">
                      <span className="w-4 text-[10px] text-white/30 text-right">{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between mb-1">
                          <span className="text-xs text-white/80 truncate">{app.name}</span>
                          <span className="text-[10px] text-white/40 ml-2 flex-shrink-0">{app.minutes}m</span>
                        </div>
                        <div className="h-1 w-full rounded-full bg-white/10">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${(app.minutes / maxMin) * 100}%`,
                              background: app.category === "productive" ? "#58f0ff" : app.category === "neutral" ? "#9c6bff" : "#ff8a8a",
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-3 pt-3 border-t border-white/[0.06] flex justify-end">
                <Link to="/app/top-apps" className="text-[10px] text-white/40 hover:text-white transition">
                  View all apps →
                </Link>
              </div>
            </GlassCard>
          )}

          {/* Google Health Connect */}
          <GlassCard
            title="Google Health"
            subtitle="Synced from Health Connect"
            accentColor="#6ef5b1"
            corner={
              <Link to="/app/settings" className="text-[10px] text-white/40 hover:text-neon transition">
                Manage →
              </Link>
            }
          >
            <MobileHealthPanel />
          </GlassCard>

          {/* Health Alerts */}
          {user?.uid && (
            <GlassCard
              title="Health Alerts"
              subtitle="Smart wellness nudges"
              accentColor="#ff8a8a"
            >
              <HealthAlertsPanel uid={user.uid} />
            </GlassCard>
          )}

          {/* Focus timeline */}
          <GlassCard
            title="Cognitive Altitude"
            subtitle="Focus quality across the day"
            accentColor="#9c6bff"
            corner={<span className="text-[10px] text-white/30">09:00 → now</span>}
          >
            <FocusTimeline data={timeline} />
            <div className="mt-3 pt-3 border-t border-white/[0.06] flex justify-end">
              <Link to="/app/timeline" className="text-[10px] text-white/40 hover:text-white transition">
                Full timeline →
              </Link>
            </div>
          </GlassCard>
        </div>

      </div>
    </motion.div>
  );
}
