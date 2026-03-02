import { useState, useRef, useEffect } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useAuth } from "../hooks/useAuth";

// ── palette ──────────────────────────────────────────────────────────────────
const DEEP = "#011023";
const MID = "#052558";
const ACCENT = "#527FB0";
const LIGHT = "#7C9FC9";

// ── frame imports ─────────────────────────────────────────────────────────────
import frame01 from "../assets/robin-julian-lee-render-pose-01-resize.jpg";
import frame02 from "../assets/robin-julian-lee-render-pose-02-resize.jpg";
import frame03 from "../assets/robin-julian-lee-render-pose-03-final.jpg";
import frame04 from "../assets/robin-julian-lee-render-pose-04-resize.jpg";
import frame05 from "../assets/robin-julian-lee-render-pose-05-resize.jpg";
import frame06 from "../assets/robin-julian-lee-pose-06-a.jpg";
import frame07 from "../assets/robin-julian-lee-render-pose-07-resize.jpg";

const FRAMES = [frame01, frame02, frame03, frame04, frame05, frame06, frame07];

// ── glitch headline ───────────────────────────────────────────────────────────
function GlitchText({ text, className }: { text: string; className?: string }) {
  return (
    <span
      className={`glitch ${className ?? ""}`}
      data-text={text}
    >
      {text}
    </span>
  );
}

// ── input field ───────────────────────────────────────────────────────────────
function InputField({
  id, type, label, value, onChange, placeholder, disabled,
}: {
  id: string; type: string; label: string; value: string;
  onChange: (v: string) => void; placeholder?: string; disabled?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-[11px] uppercase tracking-[0.25em] font-medium"
        style={{ color: LIGHT }}>
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 outline-none transition-all duration-300 disabled:opacity-40"
          style={{
            background: "rgba(5,37,88,0.5)",
            border: `1px solid ${focused ? ACCENT : "rgba(82,127,176,0.2)"}`,
            boxShadow: focused ? `0 0 0 3px rgba(82,127,176,0.15), inset 0 1px 0 rgba(124,159,201,0.08)` : "none",
          }}
        />
        {/* bottom glow line */}
        <div
          className="absolute bottom-0 left-0 h-px transition-all duration-500"
          style={{
            width: focused ? "100%" : "0%",
            background: `linear-gradient(90deg, transparent, ${ACCENT}, ${LIGHT}, transparent)`,
          }}
        />
      </div>
    </div>
  );
}

// ── main ──────────────────────────────────────────────────────────────────────
export function LoginPage() {
  const { signIn, signInWithEmail, signUpWithEmail, loading } = useAuth();

  const scrollRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ container: scrollRef });

  // Map progress 0→1 to frame index 0→6
  const [activeFrame, setActiveFrame] = useState(0);
  useEffect(() => {
    const unsubscribe = scrollYProgress.on("change", v => {
      setActiveFrame(Math.min(6, Math.floor(v * 7)));
    });
    return unsubscribe;
  }, [scrollYProgress]);

  // Parallax: character moves slightly relative to container on scroll
  const charY = useTransform(scrollYProgress, [0, 1], ["0%", "8%"]);
  const bgScale = useTransform(scrollYProgress, [0, 1], [1, 1.06]);

  // Auth state
  const [tab, setTab] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleEmailAuth = async () => {
    if (!email || !password) { setError("Please fill in all fields."); return; }
    setError("");
    setSubmitting(true);
    try {
      if (tab === "signin") {
        await signInWithEmail(email, password);
      } else {
        await signUpWithEmail(email, password);
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Authentication failed.";
      // friendlier messages
      if (msg.includes("wrong-password") || msg.includes("invalid-credential")) {
        setError("Incorrect email or password.");
      } else if (msg.includes("user-not-found")) {
        setError("No account with that email.");
      } else if (msg.includes("email-already-in-use")) {
        setError("Email already in use. Try signing in.");
      } else if (msg.includes("weak-password")) {
        setError("Password must be at least 6 characters.");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const busy = loading || submitting;

  return (
    /* Outer scroll driver — tall enough for frame animation */
    <div
      ref={scrollRef}
      className="login-scroll relative h-screen overflow-y-scroll"
      style={{ background: DEEP }}
    >
      {/* ── Noise film grain ── */}
      <div
        className="pointer-events-none fixed inset-0 z-[5] scanlines mix-blend-overlay opacity-[0.04]"
      />

      {/* ── Scroll content — 700vh gives frames room to breathe ── */}
      <div style={{ height: "700vh" }}>

        {/* ── Sticky viewport ── */}
        <div className="sticky top-0 h-screen overflow-hidden flex">

          {/* ══════════ LEFT: Frame Stage (60%) ══════════════════════════════ */}
          <div className="relative hidden md:block" style={{ width: "60%", flexShrink: 0 }}>

            {/* Deep background wallpaper */}
            <motion.div
              className="absolute inset-0"
              style={{ scale: bgScale, background: `radial-gradient(ellipse 80% 60% at 50% 40%, ${MID}99 0%, ${DEEP} 65%)` }}
            />

            {/* Horizontal scan grid lines */}
            <div className="absolute inset-0 z-[1]"
              style={{
                backgroundImage: `
                  linear-gradient(90deg, rgba(82,127,176,0.04) 1px, transparent 1px),
                  linear-gradient(0deg, rgba(82,127,176,0.04) 1px, transparent 1px)
                `,
                backgroundSize: "60px 60px",
              }}
            />

            {/* Vignette edge */}
            <div className="absolute inset-0 z-[2]"
              style={{ background: `radial-gradient(ellipse at center, transparent 45%, ${DEEP}CC 100%)` }}
            />

            {/* Frame images — cross-fade via opacity */}
            {FRAMES.map((src, i) => (
              <AnimatePresence key={i} mode="wait">
                {activeFrame === i && (
                  <motion.div
                    key={`frame-${i}`}
                    className="absolute inset-0 z-[3] flex items-end justify-center overflow-hidden"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.6, ease: "easeInOut" }}
                  >
                    <motion.img
                      src={src}
                      alt={`pose-${i + 1}`}
                      style={{ y: charY }}
                      className="h-full w-full object-cover object-center select-none"
                      draggable={false}
                    />
                    {/* Frame caption */}
                    <div className="absolute bottom-8 left-8 z-[4]">
                      <p className="text-[10px] uppercase tracking-[0.3em] font-mono"
                        style={{ color: `${ACCENT}80` }}>
                        {String(i + 1).padStart(2, "0")} / 07
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            ))}

            {/* Frame progress dots */}
            <div className="absolute right-6 top-1/2 z-[10] flex -translate-y-1/2 flex-col gap-2.5">
              {FRAMES.map((_, i) => (
                <div
                  key={i}
                  className="h-1 rounded-full transition-all duration-500"
                  style={{
                    width: activeFrame === i ? 24 : 6,
                    background: activeFrame === i ? LIGHT : `${ACCENT}40`,
                  }}
                />
              ))}
            </div>

            {/* Brand watermark top-left */}
            <div className="absolute left-8 top-8 z-[10] flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg"
                style={{ background: `linear-gradient(135deg, ${ACCENT}, ${LIGHT})` }}>
                <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"
                  stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                </svg>
              </div>
              <span className="font-semibold text-sm tracking-wide text-white/70">FlowPulse</span>
            </div>

            {/* Scroll hint */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[10] flex flex-col items-center gap-2 opacity-50">
              <p className="text-[9px] uppercase tracking-[0.4em]" style={{ color: ACCENT }}>Scroll to explore</p>
              <motion.div
                className="h-6 w-px"
                style={{ background: `linear-gradient(to bottom, ${ACCENT}, transparent)` }}
                animate={{ scaleY: [1, 0.4, 1], opacity: [0.6, 0.2, 0.6] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
              />
            </div>
          </div>

          {/* ══════════ RIGHT: Auth Panel (40%) ══════════════════════════════ */}
          <div
            className="relative flex flex-1 items-center justify-center overflow-y-auto px-8 py-12"
            style={{ background: `${DEEP}F5`, borderLeft: `1px solid rgba(82,127,176,0.1)` }}
          >
            {/* Ambient glow */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-64"
              style={{ background: `radial-gradient(ellipse 80% 50% at 50% -10%, rgba(82,127,176,0.12) 0%, transparent 60%)` }}
            />

            <motion.div
              className="relative z-10 w-full max-w-sm"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              {/* Logo */}
              <div className="mb-8 flex flex-col items-center gap-3">
                <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl"
                  style={{ background: `linear-gradient(135deg, ${MID}, ${ACCENT})`, boxShadow: `0 0 30px rgba(82,127,176,0.35)` }}>
                  <svg className="h-7 w-7 text-white" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                  </svg>
                  <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full animate-pulse"
                    style={{ background: LIGHT, boxShadow: `0 0 8px ${LIGHT}` }} />
                </div>
                <div className="text-center">
                  <h1 className="font-display text-4xl font-bold tracking-tight text-white">
                    <GlitchText text="FlowPulse" />
                  </h1>
                  <p className="mt-1 text-[10px] uppercase tracking-[0.45em]" style={{ color: `${ACCENT}90` }}>
                    Productivity Intelligence
                  </p>
                </div>
              </div>

              {/* Tab switcher */}
              <div className="mb-6 flex rounded-xl p-1" style={{ background: "rgba(5,37,88,0.5)", border: `1px solid rgba(82,127,176,0.15)` }}>
                {(["signin", "signup"] as const).map(t => (
                  <button
                    key={t}
                    onClick={() => { setTab(t); setError(""); }}
                    className="flex-1 rounded-lg py-2 text-xs font-semibold uppercase tracking-[0.15em] transition-all duration-300"
                    style={{
                      background: tab === t ? `linear-gradient(135deg, ${ACCENT}60, ${MID}CC)` : "transparent",
                      color: tab === t ? "#fff" : `${ACCENT}80`,
                      boxShadow: tab === t ? `0 0 20px rgba(82,127,176,0.25)` : "none",
                    }}
                  >
                    {t === "signin" ? "Sign In" : "Sign Up"}
                  </button>
                ))}
              </div>

              {/* Google button */}
              <motion.button
                onClick={signIn}
                disabled={busy}
                className="group relative mb-4 flex w-full items-center justify-center gap-3 overflow-hidden rounded-xl border px-5 py-3.5 text-sm font-semibold text-white transition-all duration-300 disabled:opacity-40"
                style={{ borderColor: "rgba(82,127,176,0.25)", background: "rgba(5,37,88,0.4)" }}
                whileHover={{ scale: 1.01, borderColor: ACCENT }}
                whileTap={{ scale: 0.99 }}
              >
                {/* shimmer */}
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/[0.06] to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                <svg className="h-5 w-5 flex-shrink-0" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                {loading ? "Connecting…" : "Continue with Google"}
              </motion.button>

              {/* Divider */}
              <div className="relative my-5 flex items-center gap-3">
                <div className="h-px flex-1" style={{ background: "rgba(82,127,176,0.15)" }} />
                <span className="text-[10px] uppercase tracking-[0.25em]" style={{ color: `${ACCENT}60` }}>
                  or with email
                </span>
                <div className="h-px flex-1" style={{ background: "rgba(82,127,176,0.15)" }} />
              </div>

              {/* Email/password form */}
              <form
                className="flex flex-col gap-4"
                onSubmit={e => { e.preventDefault(); handleEmailAuth(); }}
              >
                <InputField
                  id="login-email"
                  type="email"
                  label="Email"
                  value={email}
                  onChange={setEmail}
                  placeholder="you@example.com"
                  disabled={busy}
                />
                <InputField
                  id="login-password"
                  type="password"
                  label="Password"
                  value={password}
                  onChange={setPassword}
                  placeholder="••••••••"
                  disabled={busy}
                />

                {/* Error */}
                <AnimatePresence>
                  {error && (
                    <motion.p
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="rounded-lg px-3 py-2 text-xs"
                      style={{ background: "rgba(255,80,80,0.1)", color: "#ff8080", border: "1px solid rgba(255,80,80,0.2)" }}
                    >
                      {error}
                    </motion.p>
                  )}
                </AnimatePresence>

                {/* Submit */}
                <motion.button
                  type="submit"
                  disabled={busy}
                  className="relative mt-1 overflow-hidden rounded-xl py-3.5 text-sm font-semibold text-white transition-all duration-300 disabled:opacity-40"
                  style={{ background: `linear-gradient(135deg, ${ACCENT}, ${MID} 60%, ${DEEP})`, boxShadow: `0 0 30px rgba(82,127,176,0.3)` }}
                  whileHover={{ scale: 1.01, boxShadow: `0 0 40px rgba(82,127,176,0.5)` }}
                  whileTap={{ scale: 0.99 }}
                >
                  <div className="absolute inset-x-0 top-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${LIGHT}60, transparent)` }} />
                  {submitting
                    ? <span className="flex items-center justify-center gap-2">
                      <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                        <circle cx="12" cy="12" r="10" strokeOpacity={0.25} />
                        <path d="M22 12a10 10 0 00-10-10" />
                      </svg>
                      {tab === "signin" ? "Signing in…" : "Creating account…"}
                    </span>
                    : tab === "signin" ? "Sign In" : "Create Account"
                  }
                </motion.button>
              </form>

              {/* Footer note */}
              <p className="mt-6 text-center text-[10px] leading-relaxed" style={{ color: `${ACCENT}55` }}>
                No browsing history stored. Productivity data only.
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
