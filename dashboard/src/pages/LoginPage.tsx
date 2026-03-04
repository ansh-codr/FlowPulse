import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring } from "framer-motion";
import { useAuth } from "../hooks/useAuth";

// ── palette ──────────────────────────────────────────────────────────────────
const DEEP = "#011023";
const MID = "#052558";
const ACCENT = "#527FB0";
const LIGHT = "#7C9FC9";

// ── frame imports ─────────────────────────────────────────────────────────────
import frame01 from "../assets/Images/robin-julian-lee-render-pose-01-resize.jpg";
import frame02 from "../assets/Images/robin-julian-lee-render-pose-02-resize.jpg";
import frame03 from "../assets/Images/robin-julian-lee-render-pose-03-final.jpg";
import frame04 from "../assets/Images/robin-julian-lee-render-pose-04-resize.jpg";
import frame05 from "../assets/Images/robin-julian-lee-render-pose-05-resize.jpg";
import frame06 from "../assets/Images/robin-julian-lee-pose-06-a.jpg";
import frame07 from "../assets/Images/robin-julian-lee-render-pose-07-resize.jpg";

const FRAMES = [frame01, frame02, frame03, frame04, frame05, frame06, frame07];

const FRAME_CAPTIONS = [
  "Master your flow",
  "Track your rhythm",
  "Channel your focus",
  "Shape your day",
  "Build momentum",
  "Transcend limits",
  "Unlock your pulse",
];

// ── glitch headline ───────────────────────────────────────────────────────────
function GlitchText({ text, className }: { text: string; className?: string }) {
  return (
    <span className={`glitch ${className ?? ""}`} data-text={text}>
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
            background: "rgba(5,37,88,0.65)",
            border: `1px solid ${focused ? ACCENT : "rgba(82,127,176,0.25)"}`,
            boxShadow: focused ? `0 0 0 3px rgba(82,127,176,0.15), inset 0 1px 0 rgba(124,159,201,0.08)` : "none",
            backdropFilter: "blur(12px)",
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

// ── particles background ──────────────────────────────────────────────────────
function FloatingParticles() {
  return (
    <div className="absolute inset-0 z-[2] pointer-events-none overflow-hidden">
      {Array.from({ length: 30 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: Math.random() * 3 + 1,
            height: Math.random() * 3 + 1,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            background: `rgba(82,127,176,${Math.random() * 0.4 + 0.1})`,
          }}
          animate={{
            y: [0, -(Math.random() * 80 + 40), 0],
            x: [0, (Math.random() - 0.5) * 40, 0],
            opacity: [0.2, 0.7, 0.2],
          }}
          transition={{
            duration: Math.random() * 6 + 6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: Math.random() * 4,
          }}
        />
      ))}
    </div>
  );
}

// ── Ripple effect on click ────────────────────────────────────────────────────
interface Ripple {
  id: number;
  x: number;
  y: number;
}

function RippleEffect({ ripples }: { ripples: Ripple[] }) {
  return (
    <>
      {ripples.map((r) => (
        <motion.div
          key={r.id}
          className="absolute pointer-events-none z-[15]"
          style={{
            left: r.x,
            top: r.y,
            width: 0,
            height: 0,
            borderRadius: "50%",
            border: `2px solid ${ACCENT}`,
            transform: "translate(-50%, -50%)",
          }}
          animate={{
            width: [0, 300, 600],
            height: [0, 300, 600],
            opacity: [0.7, 0.3, 0],
          }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
      ))}
    </>
  );
}

// ── main ──────────────────────────────────────────────────────────────────────
export function LoginPage() {
  const { signIn, signInWithEmail, signUpWithEmail, loading } = useAuth();

  // Frame animation state — auto-cycles
  const [activeFrame, setActiveFrame] = useState(0);
  const autoTimerRef = useRef<ReturnType<typeof setInterval>>();

  // Whether the login portal is revealed
  const [portalOpen, setPortalOpen] = useState(false);

  // Ripple effects
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const rippleIdRef = useRef(0);

  // Mouse parallax
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 50, damping: 20 });

  // Click count for portal reveal
  const clickCountRef = useRef(0);
  const clickTimerRef = useRef<ReturnType<typeof setTimeout>>();

  // Auto-cycle frames
  useEffect(() => {
    autoTimerRef.current = setInterval(() => {
      if (!portalOpen) {
        setActiveFrame(prev => (prev + 1) % FRAMES.length);
      }
    }, 3000);
    return () => clearInterval(autoTimerRef.current);
  }, [portalOpen]);

  // Parallax mouse tracking
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 30;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 20;
    mouseX.set(x);
    mouseY.set(y);
  }, [mouseX, mouseY]);

  // Handle image interaction — click to advance frame + ripple
  const handleImageInteraction = useCallback((e: React.MouseEvent) => {
    // Add ripple
    const id = ++rippleIdRef.current;
    setRipples(prev => [...prev, { id, x: e.clientX, y: e.clientY }]);
    setTimeout(() => setRipples(prev => prev.filter(r => r.id !== id)), 1500);

    // Advance frame on click
    setActiveFrame(prev => (prev + 1) % FRAMES.length);

    // Reset the auto timer
    clearInterval(autoTimerRef.current);
    autoTimerRef.current = setInterval(() => {
      if (!portalOpen) {
        setActiveFrame(prev => (prev + 1) % FRAMES.length);
      }
    }, 3000);

    // Count rapid clicks to open portal
    clickCountRef.current += 1;
    clearTimeout(clickTimerRef.current);
    clickTimerRef.current = setTimeout(() => {
      clickCountRef.current = 0;
    }, 2000);

    if (clickCountRef.current >= 3) {
      setPortalOpen(true);
      clickCountRef.current = 0;
    }
  }, [portalOpen, mouseX]); // eslint-disable-line react-hooks/exhaustive-deps

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
    <div
      className="relative h-screen w-screen overflow-hidden"
      style={{ background: DEEP }}
      onMouseMove={handleMouseMove}
    >
      {/* ── Noise film grain ── */}
      <div className="pointer-events-none fixed inset-0 z-[20] scanlines mix-blend-overlay opacity-[0.04]" />

      {/* ── Floating particles ── */}
      <FloatingParticles />

      {/* ── Click ripples ── */}
      <RippleEffect ripples={ripples} />

      {/* ════════ FULL-SCREEN Frame Stage ════════════════════════════════════ */}

      {/* Deep background wallpaper with parallax */}
      <motion.div
        className="absolute inset-0 z-[0]"
        style={{
          x: springX,
          y: springY,
          scale: 1.08,
          background: `radial-gradient(ellipse 80% 60% at 50% 40%, ${MID}99 0%, ${DEEP} 65%)`,
        }}
      />

      {/* Horizontal scan grid lines */}
      <div
        className="absolute inset-0 z-[1]"
        style={{
          backgroundImage: `
            linear-gradient(90deg, rgba(82,127,176,0.035) 1px, transparent 1px),
            linear-gradient(0deg, rgba(82,127,176,0.035) 1px, transparent 1px)
          `,
          backgroundSize: "80px 80px",
        }}
      />

      {/* Frame images — FULL-SCREEN with parallax and cross-fade */}
      {FRAMES.map((src, i) => (
        <AnimatePresence key={i} mode="wait">
          {activeFrame === i && (
            <motion.div
              key={`frame-${i}`}
              className="absolute inset-0 z-[3] overflow-hidden cursor-pointer"
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
              onClick={handleImageInteraction}
            >
              <motion.img
                src={src}
                alt={`pose-${i + 1}`}
                style={{ x: springX, y: springY }}
                className="h-full w-full object-cover object-center select-none scale-110"
                draggable={false}
              />
            </motion.div>
          )}
        </AnimatePresence>
      ))}

      {/* Dramatic vignette overlay */}
      <div
        className="absolute inset-0 z-[4] pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse at center, transparent 30%, ${DEEP}99 70%, ${DEEP} 100%),
            linear-gradient(to top, ${DEEP}DD 0%, transparent 40%),
            linear-gradient(to bottom, ${DEEP}99 0%, transparent 25%)
          `,
        }}
      />

      {/* ═══════════ OVERLAY UI (always visible) ═══════════════════════════ */}

      {/* Brand watermark top-left */}
      <div className="absolute left-8 top-8 z-[30] flex items-center gap-2.5">
        <div
          className="flex h-9 w-9 items-center justify-center rounded-lg"
          style={{ background: `linear-gradient(135deg, ${ACCENT}, ${LIGHT})`, boxShadow: `0 0 25px rgba(82,127,176,0.4)` }}
        >
          <svg className="h-4.5 w-4.5 text-white" fill="none" viewBox="0 0 24 24"
            stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
          </svg>
        </div>
        <span className="font-semibold text-sm tracking-wide text-white/80">FlowPulse</span>
      </div>

      {/* Frame progress dots — vertical right side */}
      <div className="absolute right-8 top-1/2 z-[30] flex -translate-y-1/2 flex-col gap-3">
        {FRAMES.map((_, i) => (
          <button
            key={i}
            onClick={(e) => {
              e.stopPropagation();
              setActiveFrame(i);
            }}
            className="group relative flex items-center justify-end gap-3 cursor-pointer"
          >
            {/* Label on hover */}
            <span
              className="text-[9px] uppercase tracking-[0.3em] font-mono opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap"
              style={{ color: `${LIGHT}CC` }}
            >
              {FRAME_CAPTIONS[i]}
            </span>
            <div
              className="rounded-full transition-all duration-500"
              style={{
                width: activeFrame === i ? 28 : 6,
                height: 6,
                background: activeFrame === i
                  ? `linear-gradient(90deg, ${ACCENT}, ${LIGHT})`
                  : `${ACCENT}40`,
                boxShadow: activeFrame === i ? `0 0 12px ${ACCENT}80` : "none",
              }}
            />
          </button>
        ))}
      </div>

      {/* Frame caption — bottom center */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeFrame}
          className="absolute bottom-24 left-1/2 z-[30] -translate-x-1/2 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-[10px] uppercase tracking-[0.4em] font-mono mb-2"
            style={{ color: `${ACCENT}70` }}>
            {String(activeFrame + 1).padStart(2, "0")} / {String(FRAMES.length).padStart(2, "0")}
          </p>
          <h2
            className="text-2xl md:text-3xl font-bold tracking-tight text-white/90"
            style={{ textShadow: `0 0 30px ${ACCENT}40` }}
          >
            {FRAME_CAPTIONS[activeFrame]}
          </h2>
        </motion.div>
      </AnimatePresence>

      {/* ═══════════ CTA — "Enter" button (visible when portal is closed) ═══════════ */}
      <AnimatePresence>
        {!portalOpen && (
          <motion.div
            className="absolute bottom-8 left-1/2 z-[30] -translate-x-1/2 flex flex-col items-center gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.4 }}
          >
            {/* Pulsing enter button */}
            <motion.button
              onClick={() => setPortalOpen(true)}
              className="group relative flex items-center gap-3 overflow-hidden rounded-2xl px-8 py-3.5 text-sm font-semibold text-white uppercase tracking-[0.2em] transition-all duration-300"
              style={{
                background: `linear-gradient(135deg, ${ACCENT}40, ${MID}80)`,
                border: `1px solid ${ACCENT}50`,
                backdropFilter: "blur(20px)",
                boxShadow: `0 0 40px ${ACCENT}25, inset 0 1px 0 ${LIGHT}15`,
              }}
              whileHover={{
                scale: 1.05,
                boxShadow: `0 0 60px ${ACCENT}40, inset 0 1px 0 ${LIGHT}25`,
              }}
              whileTap={{ scale: 0.97 }}
            >
              {/* Shimmer */}
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/[0.08] to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Enter FlowPulse
            </motion.button>

            {/* Hint text */}
            <p className="text-[9px] uppercase tracking-[0.4em] opacity-40" style={{ color: ACCENT }}>
              Click image or tap to explore · Triple-click to reveal
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════════ LOGIN PORTAL — Emerges from center ═══════════════════ */}
      <AnimatePresence>
        {portalOpen && (
          <>
            {/* Darkened backdrop */}
            <motion.div
              className="absolute inset-0 z-[40]"
              style={{ background: `${DEEP}CC`, backdropFilter: "blur(8px)" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              onClick={() => setPortalOpen(false)}
            />

            {/* The login card */}
            <motion.div
              className="absolute inset-0 z-[50] flex items-center justify-center px-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={(e) => {
                if (e.target === e.currentTarget) setPortalOpen(false);
              }}
            >
              <motion.div
                className="relative w-full max-w-md rounded-3xl overflow-hidden"
                style={{
                  background: `linear-gradient(145deg, ${DEEP}F5, ${MID}40)`,
                  border: `1px solid ${ACCENT}30`,
                  boxShadow: `
                    0 0 80px ${ACCENT}20,
                    0 0 160px ${MID}15,
                    inset 0 1px 0 ${LIGHT}12
                  `,
                  backdropFilter: "blur(40px)",
                }}
                initial={{ scale: 0.7, y: 60, opacity: 0, rotateX: 15 }}
                animate={{ scale: 1, y: 0, opacity: 1, rotateX: 0 }}
                exit={{ scale: 0.8, y: 40, opacity: 0, rotateX: -10 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              >
                {/* Top accent bar */}
                <div
                  className="h-[2px] w-full"
                  style={{
                    background: `linear-gradient(90deg, transparent, ${ACCENT}, ${LIGHT}, ${ACCENT}, transparent)`,
                  }}
                />

                {/* Ambient glow on the card */}
                <div
                  className="absolute inset-x-0 top-0 h-40 pointer-events-none"
                  style={{
                    background: `radial-gradient(ellipse 70% 50% at 50% -5%, ${ACCENT}20 0%, transparent 60%)`,
                  }}
                />

                {/* Close button */}
                <button
                  onClick={() => setPortalOpen(false)}
                  className="absolute right-4 top-4 z-[60] flex h-8 w-8 items-center justify-center rounded-full transition-all duration-300 hover:bg-white/10"
                  style={{ color: `${ACCENT}80` }}
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                <div className="relative z-10 px-8 py-10 md:px-10">
                  {/* Logo + heading */}
                  <motion.div
                    className="mb-8 flex flex-col items-center gap-3"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15, duration: 0.5 }}
                  >
                    <div
                      className="relative flex h-14 w-14 items-center justify-center rounded-2xl"
                      style={{
                        background: `linear-gradient(135deg, ${MID}, ${ACCENT})`,
                        boxShadow: `0 0 30px ${ACCENT}45`,
                      }}
                    >
                      <svg className="h-7 w-7 text-white" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                      </svg>
                      <span
                        className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full animate-pulse"
                        style={{ background: LIGHT, boxShadow: `0 0 8px ${LIGHT}` }}
                      />
                    </div>
                    <div className="text-center">
                      <h1 className="font-display text-3xl font-bold tracking-tight text-white">
                        <GlitchText text="FlowPulse" />
                      </h1>
                      <p className="mt-1 text-[10px] uppercase tracking-[0.45em]"
                        style={{ color: `${ACCENT}90` }}>
                        Productivity Intelligence
                      </p>
                    </div>
                  </motion.div>

                  {/* Tab switcher */}
                  <motion.div
                    className="mb-6 flex rounded-xl p-1"
                    style={{
                      background: "rgba(5,37,88,0.5)",
                      border: `1px solid rgba(82,127,176,0.15)`,
                    }}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                  >
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
                  </motion.div>

                  {/* Google button */}
                  <motion.button
                    onClick={signIn}
                    disabled={busy}
                    className="group relative mb-4 flex w-full items-center justify-center gap-3 overflow-hidden rounded-xl border px-5 py-3.5 text-sm font-semibold text-white transition-all duration-300 disabled:opacity-40"
                    style={{
                      borderColor: "rgba(82,127,176,0.25)",
                      background: "rgba(5,37,88,0.5)",
                    }}
                    whileHover={{ scale: 1.01, borderColor: ACCENT }}
                    whileTap={{ scale: 0.99 }}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25, duration: 0.5 }}
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
                  <motion.div
                    className="relative my-5 flex items-center gap-3"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                  >
                    <div className="h-px flex-1" style={{ background: "rgba(82,127,176,0.15)" }} />
                    <span className="text-[10px] uppercase tracking-[0.25em]" style={{ color: `${ACCENT}60` }}>
                      or with email
                    </span>
                    <div className="h-px flex-1" style={{ background: "rgba(82,127,176,0.15)" }} />
                  </motion.div>

                  {/* Email/password form */}
                  <motion.form
                    className="flex flex-col gap-4"
                    onSubmit={e => { e.preventDefault(); handleEmailAuth(); }}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35, duration: 0.5 }}
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
                          style={{
                            background: "rgba(255,80,80,0.1)",
                            color: "#ff8080",
                            border: "1px solid rgba(255,80,80,0.2)",
                          }}
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
                      style={{
                        background: `linear-gradient(135deg, ${ACCENT}, ${MID} 60%, ${DEEP})`,
                        boxShadow: `0 0 30px rgba(82,127,176,0.3)`,
                      }}
                      whileHover={{ scale: 1.01, boxShadow: `0 0 40px rgba(82,127,176,0.5)` }}
                      whileTap={{ scale: 0.99 }}
                    >
                      <div className="absolute inset-x-0 top-0 h-px"
                        style={{ background: `linear-gradient(90deg, transparent, ${LIGHT}60, transparent)` }} />
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
                  </motion.form>

                  {/* Footer note */}
                  <motion.p
                    className="mt-6 text-center text-[10px] leading-relaxed"
                    style={{ color: `${ACCENT}55` }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.45, duration: 0.5 }}
                  >
                    No browsing history stored. Productivity data only.
                  </motion.p>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
