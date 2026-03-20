import { NavLink, Outlet } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../hooks/useAuth";
import { useExtensionDetect } from "../hooks/useExtensionDetect";
import { useState, useEffect } from "react";

const nav = [
  {
    label: "Dashboard",
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
    label: "Apps",
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
];

export function DashboardLayout() {
  const { user, signOut } = useAuth();
  const { detected: extensionDetected } = useExtensionDetect();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);

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
    <div className="min-h-screen text-white flex flex-col py-4 px-4 sm:py-6 sm:px-6">
      {/* Main Bento Container */}
      <div className="w-full flex-1 rounded-[32px] border border-white/10 bg-black/40 backdrop-blur-3xl overflow-hidden flex flex-col relative shadow-2xl">
        {/* Glow Effects inside container */}
        <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 animate-orb-drift rounded-full bg-white/5 blur-3xl" />
        <div className="pointer-events-none absolute -right-20 bottom-10 h-72 w-72 animate-orb-drift-2 rounded-full bg-neon/5 blur-3xl" />

        {/* ── Top Navbar ── */}
        <header className="relative z-20 flex items-center justify-between px-6 py-5 border-b border-white/[0.06] bg-white/[0.02]">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 border border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.1)]">
              <span className="font-display text-sm font-bold text-white">FP</span>
              <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-neon shadow-[0_0_10px_rgba(88,240,255,0.8)]" />
            </div>
            <p className="font-display text-xl font-semibold leading-tight text-white hidden sm:block">FlowPulse</p>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-1 bg-white/[0.03] p-1.5 rounded-full border border-white/[0.05]">
            {nav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/app"}
                className={({ isActive }) =>
                  `relative flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
                    isActive ? "text-white" : "text-white/50 hover:text-white/80 hover:bg-white/[0.04]"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <motion.div
                        layoutId="nav-active"
                        className="absolute inset-0 rounded-full bg-white/[0.12]"
                        style={{ boxShadow: "inset 0 0 0 1px rgba(88,240,255,0.2)" }}
                        transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                      />
                    )}
                    <span className="relative z-10 hidden lg:block">{item.icon}</span>
                    <span className="relative z-10">{item.label}</span>
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            <NavLink
              to="/app/settings"
              className={({ isActive }) => `flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition ${isActive ? 'bg-white/10 text-white' : 'text-white/60 hover:bg-white/[0.06] hover:text-white'}`}
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
              </svg>
              <span className="hidden sm:inline">Settings</span>
            </NavLink>

            <button className="flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.04] border border-white/10 text-white/70 hover:bg-white/10 hover:text-white transition relative">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 01-3.46 0" />
              </svg>
              <span className="absolute top-2 right-2.5 h-1.5 w-1.5 rounded-full bg-neon shadow-[0_0_5px_rgba(88,240,255,1)]" />
            </button>

            {user && (
              <div className="relative group pl-1">
                {user.photoURL ? (
                  <img src={user.photoURL} alt="" className="h-9 w-9 rounded-full ring-2 ring-white/10 group-hover:ring-neon/50 transition cursor-pointer object-cover" />
                ) : (
                  <div className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-white/10 border border-white/20 text-sm font-bold text-white shadow-[0_4px_12px_rgba(0,0,0,0.2)] group-hover:border-neon/50 transition">
                    {(user.displayName ?? user.email ?? "U")[0].toUpperCase()}
                  </div>
                )}
                
                {/* Simple dropdown */}
                <div className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-white/10 bg-black/80 backdrop-blur-xl p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                  <div className="px-3 py-2 border-b border-white/10 mb-2">
                     <p className="truncate text-sm font-semibold text-white">{user.displayName ?? "User"}</p>
                     <p className="truncate text-xs text-white/40">{user.email}</p>
                  </div>
                  <button onClick={handleSignOut} disabled={isSigningOut} className="w-full text-left rounded-lg px-3 py-2 text-sm text-red-400 hover:bg-white/5 transition">
                    {isSigningOut ? "Signing out..." : "Sign out"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* ── Main content area ── */}
        <main className="relative z-10 flex-1 overflow-y-auto p-6 sm:p-8 scrollbar-hide">
          {/* Extension banner */}
          <AnimatePresence>
            {showExtensionBanner && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="mb-8 flex items-center gap-4 rounded-2xl px-6 py-4"
                style={{
                  background: "linear-gradient(135deg, rgba(88,240,255,0.08), rgba(109,109,255,0.06))",
                  border: "1px solid rgba(88,240,255,0.18)",
                }}
              >
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-neon/10">
                  <svg className="h-6 w-6 text-neon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-base font-semibold text-white">Chrome Extension Not Detected</p>
                  <p className="text-sm text-white/40 mt-0.5">Install the FlowPulse extension to start tracking your productivity in real-time.</p>
                </div>
                <a
                  href="/extension"
                  className="flex-shrink-0 rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition shadow-[0_0_15px_rgba(88,240,255,0.2)] hover:shadow-[0_0_20px_rgba(88,240,255,0.4)]"
                  style={{
                    background: "linear-gradient(135deg, rgba(88,240,255,0.25), rgba(109,109,255,0.2))",
                    border: "1px solid rgba(88,240,255,0.3)",
                  }}
                >
                  Install Extension
                </a>
                <button
                  onClick={dismissBanner}
                  className="flex-shrink-0 rounded-xl p-2 text-white/30 transition hover:bg-white/[0.06] hover:text-white/60 ml-2"
                  aria-label="Dismiss"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            <Outlet />
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
