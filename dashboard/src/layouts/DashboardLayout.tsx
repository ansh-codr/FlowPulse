import { NavLink, Outlet } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../hooks/useAuth";
import { useExtensionDetect } from "../hooks/useExtensionDetect";
import { useState, useEffect } from "react";

const nav = [
  {
    label: "Overview",
    to: "/app",
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" />
      </svg>
    ),
  },
  {
    label: "Timeline",
    to: "/app/timeline",
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
  {
    label: "Heatmap",
    to: "/app/heatmap",
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
    to: "/app/top-apps",
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
  },
  {
    label: "Sessions",
    to: "/app/sessions",
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
        <line x1="12" y1="12" x2="12" y2="16" /><line x1="10" y1="14" x2="14" y2="14" />
      </svg>
    ),
  },
  {
    label: "Leaderboard",
    to: "/app/leaderboard",
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 9H4a2 2 0 00-2 2v7a2 2 0 002 2h2" /><path d="M18 9h2a2 2 0 012 2v7a2 2 0 01-2 2h-2" />
        <rect x="8" y="4" width="8" height="16" rx="2" />
      </svg>
    ),
  },
  {
    label: "Insights",
    to: "/app/insights",
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
        <circle cx="12" cy="12" r="4" />
      </svg>
    ),
  },
  {
    label: "Settings",
    to: "/app/settings",
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
      </svg>
    ),
  },
];

export function DashboardLayout() {
  const { user, signOut } = useAuth();
  const { detected: extensionDetected } = useExtensionDetect();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  // Persist dismissal for 24 hours so the banner doesn't nag
  useEffect(() => {
    const ts = localStorage.getItem("fp_ext_banner_dismissed");
    if (ts && Date.now() - Number(ts) < 24 * 60 * 60 * 1000) {
      setBannerDismissed(true);
    }
  }, []);

  function dismissBanner() {
    setBannerDismissed(true);
    localStorage.setItem("fp_ext_banner_dismissed", String(Date.now()));
  }

  const showExtensionBanner = extensionDetected === false && !bannerDismissed;

  async function handleSignOut() {
    setIsSigningOut(true);
    await signOut();
  }

  return (
    <div className="grid min-h-screen grid-cols-[240px_1fr] text-white">
      {/* ── Sidebar ── */}
      <aside
        className="relative flex flex-col gap-5 overflow-hidden border-r border-white/10 p-5 bg-white/[0.02] backdrop-blur-xl"
      >
        {/* Sidebar ambient glow */}
        <div className="pointer-events-none absolute -left-10 -top-10 h-48 w-48 rounded-full bg-white/5 blur-3xl" />

        {/* Logo */}
        <div className="relative flex items-center gap-3 pb-2">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 border border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.1)]">
            <span className="font-display text-sm font-bold text-white">FP</span>
            <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-white/80 shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
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
              end={item.to === "/app"}
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
                      style={{ boxShadow: "inset 0 0 0 1px rgba(88,240,255,0.12)" }}
                      transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                    />
                  )}
                  <span className={`relative z-10 transition-colors ${isActive ? "text-white" : "text-white/40 group-hover:text-white/60"}`}>
                    {item.icon}
                  </span>
                  <span className="relative z-10">{item.label}</span>
                  {isActive && (
                    <span className="relative z-10 ml-auto h-1.5 w-1.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
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
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-white/10 border border-white/20 text-sm font-bold text-white shadow-[0_4px_12px_rgba(0,0,0,0.2)]">
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
              className="w-full rounded-xl border border-white/[0.06] bg-white/[0.04] px-3 py-2 text-xs text-white/50 transition hover:border-white/30 hover:bg-white/10 hover:text-white disabled:opacity-50"
            >
              {isSigningOut ? "Signing out…" : "Sign out"}
            </button>
          </div>
        )}

        <p className="text-[10px] text-white/20">v2.0 · FlowPulse</p>
      </aside>

      {/* ── Main content ── */}
      <main className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -right-32 -top-32 h-96 w-96 animate-orb-drift rounded-full bg-white/5 blur-3xl" />
          <div className="absolute -bottom-24 left-24 h-80 w-80 animate-orb-drift-2 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute right-1/3 top-1/2 h-64 w-64 animate-orb-drift-3 rounded-full bg-white/[0.02] blur-3xl" />
        </div>
        <section className="relative z-10 min-h-screen p-8">
          {/* Extension not detected banner */}
          <AnimatePresence>
            {showExtensionBanner && (
              <motion.div
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="mb-6 flex items-center gap-4 rounded-2xl px-5 py-4"
                style={{
                  background: "linear-gradient(135deg, rgba(88,240,255,0.08), rgba(109,109,255,0.06))",
                  border: "1px solid rgba(88,240,255,0.18)",
                }}
              >
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-neon/10">
                  <svg className="h-5 w-5 text-neon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-white">Chrome Extension Not Detected</p>
                  <p className="text-xs text-white/40">Install the FlowPulse extension to start tracking your productivity in real-time.</p>
                </div>
                <a
                  href="/extension"
                  className="flex-shrink-0 rounded-xl px-4 py-2 text-xs font-semibold text-white transition"
                  style={{
                    background: "linear-gradient(135deg, rgba(88,240,255,0.25), rgba(109,109,255,0.2))",
                    border: "1px solid rgba(88,240,255,0.3)",
                  }}
                >
                  Install Extension
                </a>
                <button
                  onClick={dismissBanner}
                  className="flex-shrink-0 rounded-lg p-1.5 text-white/30 transition hover:bg-white/[0.06] hover:text-white/60"
                  aria-label="Dismiss"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            <Outlet />
          </AnimatePresence>
        </section>
      </main>
    </div>
  );
}
