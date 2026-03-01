import { NavLink, Outlet } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../hooks/useAuth";
import { useState } from "react";

const nav = [
  {
    label: "Overview",
    to: "/",
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" />
      </svg>
    ),
  },
  {
    label: "Timeline",
    to: "/timeline",
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
  {
    label: "Heatmap",
    to: "/heatmap",
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="4" height="4" rx="1" /><rect x="10" y="3" width="4" height="4" rx="1" /><rect x="17" y="3" width="4" height="4" rx="1" />
        <rect x="3" y="10" width="4" height="4" rx="1" /><rect x="10" y="10" width="4" height="4" rx="1" /><rect x="17" y="10" width="4" height="4" rx="1" />
        <rect x="3" y="17" width="4" height="4" rx="1" /><rect x="10" y="17" width="4" height="4" rx="1" /><rect x="17" y="17" width="4" height="4" rx="1" />
      </svg>
    ),
  },
  {
    label: "Top Apps",
    to: "/top-apps",
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
  },
  {
    label: "Sessions",
    to: "/sessions",
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
        <line x1="12" y1="12" x2="12" y2="16" /><line x1="10" y1="14" x2="14" y2="14" />
      </svg>
    ),
  },
  {
    label: "Leaderboard",
    to: "/leaderboard",
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 9H4a2 2 0 00-2 2v7a2 2 0 002 2h2" /><path d="M18 9h2a2 2 0 012 2v7a2 2 0 01-2 2h-2" />
        <rect x="8" y="4" width="8" height="16" rx="2" /><path d="M10 4V2m4 2V2" />
      </svg>
    ),
  },
  {
    label: "Settings",
    to: "/settings",
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83l-.06.06a2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
      </svg>
    ),
  },
];

export function DashboardLayout() {
  const { user, signOut } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);

  async function handleSignOut() {
    setIsSigningOut(true);
    await signOut();
  }

  return (
    <div className="grid min-h-screen grid-cols-[240px_1fr] bg-night text-white">
      {/* ── Sidebar ── */}
      <aside
        className="relative flex flex-col gap-5 overflow-hidden border-r border-white/[0.06] p-5"
        style={{
          background: "linear-gradient(180deg, rgba(109,109,255,0.06) 0%, rgba(88,240,255,0.02) 100%)",
        }}
      >
        {/* Sidebar ambient glow */}
        <div className="pointer-events-none absolute -left-10 -top-10 h-48 w-48 rounded-full bg-plasma/20 blur-3xl" />

        {/* Logo */}
        <div className="relative flex items-center gap-3 pb-2">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-plasma to-aurora shadow-glow-plasma">
            <span className="font-display text-sm font-bold text-white">FP</span>
            {/* Pulse indicator */}
            <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 animate-pulse-glow rounded-full bg-neon shadow-glow-neon" />
          </div>
          <div>
            <p className="font-display text-lg font-semibold leading-tight text-white">FlowPulse</p>
            <p className="text-[10px] uppercase tracking-[0.5em] text-white/40">Intelligence</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="relative flex flex-col gap-1">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                `group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${isActive
                  ? "text-white"
                  : "text-white/50 hover:text-white/80 hover:bg-white/[0.04]"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.div
                      layoutId="nav-active"
                      className="absolute inset-0 rounded-xl bg-white/[0.08]"
                      style={{
                        boxShadow: "inset 0 0 0 1px rgba(88,240,255,0.12)",
                      }}
                      transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                    />
                  )}
                  <span className={`relative z-10 transition-colors ${isActive ? "text-neon" : "text-white/40 group-hover:text-white/60"}`}>
                    {item.icon}
                  </span>
                  <span className="relative z-10">{item.label}</span>
                  {isActive && (
                    <span className="relative z-10 ml-auto h-1.5 w-1.5 rounded-full bg-neon shadow-glow-neon" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User info */}
        {user && (
          <div className="mt-auto space-y-2">
            <div className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.04] p-3">
              {user.photoURL ? (
                <div className="relative h-8 w-8 flex-shrink-0">
                  <img src={user.photoURL} alt="" className="h-8 w-8 rounded-full" />
                  <div className="absolute inset-0 rounded-full ring-1 ring-neon/30" />
                </div>
              ) : (
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-aurora/60 to-plasma/60 text-sm font-bold text-white shadow-glow-aurora">
                  {(user.displayName ?? user.email ?? "U")[0].toUpperCase()}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-white">{user.displayName ?? "User"}</p>
                <p className="truncate text-[11px] text-white/40">{user.email}</p>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              disabled={isSigningOut}
              className="w-full rounded-xl border border-white/[0.06] bg-white/[0.04] px-3 py-2 text-xs text-white/50 transition hover:border-ember/30 hover:bg-ember/10 hover:text-ember disabled:opacity-50"
            >
              {isSigningOut ? "Signing out…" : "Sign out"}
            </button>
          </div>
        )}

        {/* Version footer */}
        <p className="text-[10px] text-white/20">v2.0 · FlowPulse</p>
      </aside>

      {/* ── Main content ── */}
      <main className="relative overflow-hidden">
        {/* Ambient background orbs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -right-32 -top-32 h-96 w-96 animate-orb-drift rounded-full bg-plasma/15 blur-3xl" />
          <div className="absolute -bottom-24 left-24 h-80 w-80 animate-orb-drift-2 rounded-full bg-aurora/10 blur-3xl" />
          <div className="absolute right-1/3 top-1/2 h-64 w-64 animate-orb-drift-3 rounded-full bg-neon/8 blur-3xl" />
        </div>

        <section className="relative z-10 min-h-screen p-8">
          <AnimatePresence mode="wait">
            <Outlet />
          </AnimatePresence>
        </section>
      </main>
    </div>
  );
}
