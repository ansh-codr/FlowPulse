import { motion } from "framer-motion";
import { useAuth } from "../hooks/useAuth";

export function LoginPage() {
  const { signIn, loading } = useAuth();

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-night">
      {/* Animated ambient orbs */}
      <motion.div
        className="pointer-events-none absolute h-[500px] w-[500px] rounded-full bg-plasma/20 blur-[100px]"
        style={{ top: "5%", left: "10%" }}
        animate={{ x: [0, 30, -20, 0], y: [0, -40, 20, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="pointer-events-none absolute h-[400px] w-[400px] rounded-full bg-aurora/15 blur-[80px]"
        style={{ bottom: "10%", right: "8%" }}
        animate={{ x: [0, -25, 15, 0], y: [0, 20, -30, 0] }}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="pointer-events-none absolute h-[300px] w-[300px] rounded-full bg-neon/10 blur-[60px]"
        style={{ top: "40%", right: "25%" }}
        animate={{ x: [0, 20, -10, 0], y: [0, -15, 25, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Login card */}
      <motion.div
        className="relative z-10 w-full max-w-sm px-5"
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <div className="relative overflow-hidden rounded-3xl border border-white/[0.08] p-8 shadow-[0_30px_80px_rgba(0,0,0,0.6)]"
          style={{ background: "rgba(255,255,255,0.04)", backdropFilter: "blur(40px)" }}>
          {/* Top gradient glow */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px"
            style={{ background: "linear-gradient(90deg, transparent, rgba(88,240,255,0.4), rgba(156,107,255,0.3), transparent)" }} />
          <div className="pointer-events-none absolute inset-x-6 top-0 h-16"
            style={{ background: "radial-gradient(ellipse at top, rgba(88,240,255,0.06), transparent)" }} />

          <div className="flex flex-col items-center gap-7">
            {/* Brand mark */}
            <motion.div
              className="flex flex-col items-center gap-3"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl shadow-glow-plasma"
                style={{ background: "linear-gradient(135deg, #6d6dff, #9c6bff)" }}>
                <svg className="h-8 w-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                </svg>
                <div className="absolute -right-1 -top-1 h-3 w-3 animate-pulse-glow rounded-full bg-neon shadow-glow-neon" />
              </div>
              <div className="text-center">
                <h1 className="font-display text-3xl font-bold tracking-tight text-white">
                  FlowPulse
                </h1>
                <p className="mt-1 text-xs uppercase tracking-[0.5em] text-white/40">
                  Productivity Intelligence
                </p>
              </div>
            </motion.div>

            <motion.p
              className="max-w-xs text-center text-sm leading-relaxed text-white/50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              Track your focus, understand your patterns, and achieve more every day.
            </motion.p>

            {/* Google Sign-In Button */}
            <motion.button
              onClick={signIn}
              disabled={loading}
              className="group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-2xl border border-white/[0.12] bg-white/[0.08] px-6 py-4 text-sm font-semibold text-white transition hover:border-white/20 hover:bg-white/[0.12] disabled:opacity-50"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              {/* Shimmer */}
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/[0.08] to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              <svg className="h-5 w-5 flex-shrink-0" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              {loading ? "Connecting…" : "Sign in with Google"}
            </motion.button>

            <p className="max-w-xs text-center text-xs text-white/25">
              Only aggregated productivity data is stored. No browsing history, no surveillance.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
