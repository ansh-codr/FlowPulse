import { useCallback, useRef, lazy, Suspense } from "react";
import { motion, useMotionValue, useSpring, useTransform, useScroll } from "framer-motion";
import { Link } from "react-router-dom";
import redOrb from "../../../assets/videos/redorb.mp4";
import {
    ACCENT, HIGHLIGHT, DEEP, EASE_SMOOTH, PARALLAX, GPU_STYLE, isMobile,
} from "../motionConfig";

const Hero3DCanvas = lazy(() => import("./Hero3DCanvas").then(m => ({ default: m.Hero3DCanvas })));

// ── Floating Glass UI Panel ────────────────────────────────────
function FloatingPanel({
    label, value, sub, delay, x, y,
}: { label: string; value: string; sub: string; delay: number; x: number; y: number }) {
    return (
        <motion.div
            className="absolute rounded-xl px-5 py-3.5 select-none pointer-events-none"
            style={{
                left: `${50 + x}%`,
                top: `${50 + y}%`,
                background: `rgba(5,37,88,0.75)`,
                border: `1px solid ${ACCENT}30`,
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                boxShadow: `0 8px 32px rgba(1,16,35,0.5), 0 0 24px ${ACCENT}10`,
                ...GPU_STYLE,
            }}
            initial={{ opacity: 0, y: 30, scale: 0.85 }}
            animate={{
                opacity: [0, 0.85],
                y: [30, 0],
                scale: [0.85, 1],
            }}
            transition={{
                delay: delay + 0.8,
                duration: 1.0,
                ease: EASE_SMOOTH as unknown as number[],
            }}
        >
            <div className="text-[9px] font-bold uppercase tracking-[0.4em] mb-1" style={{ color: ACCENT }}>
                {label}
            </div>
            <div className="font-display text-xl font-black text-white leading-none">
                {value}
            </div>
            <div className="text-[10px] mt-0.5" style={{ color: `${HIGHLIGHT}60` }}>
                {sub}
            </div>
        </motion.div>
    );
}

// ── Glow Pulse ring behind hero ────────────────────────────────
function GlowPulse() {
    return (
        <motion.div
            className="absolute rounded-full pointer-events-none"
            style={{
                width: 500,
                height: 500,
                left: "50%",
                top: "50%",
                transform: "translate(-50%, -50%)",
                background: `radial-gradient(
                    circle,
                    ${ACCENT}08 0%,
                    ${ACCENT}04 40%,
                    transparent 70%
                )`,
            }}
            animate={{
                scale: [1, 1.15, 1],
                opacity: [0.5, 0.8, 0.5],
            }}
            transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
            }}
        />
    );
}

export function HeroScene() {
    const containerRef = useRef<HTMLDivElement>(null);
    const mobile = isMobile();

    // ── Mouse parallax ────────────────────────────────────
    const rawX = useMotionValue(0);
    const rawY = useMotionValue(0);
    const springX = useSpring(rawX, { stiffness: 35, damping: 20 });
    const springY = useSpring(rawY, { stiffness: 35, damping: 20 });

    // Depth layers: bg (slow) → midground → foreground (subtle)
    const bgX = useTransform(springX, [-400, 400], [-PARALLAX.bg.mouseMultiplier * PARALLAX.mouseIntensity.x, PARALLAX.bg.mouseMultiplier * PARALLAX.mouseIntensity.x]);
    const bgY = useTransform(springY, [-400, 400], [-PARALLAX.bg.mouseMultiplier * PARALLAX.mouseIntensity.y, PARALLAX.bg.mouseMultiplier * PARALLAX.mouseIntensity.y]);
    const midX = useTransform(springX, [-400, 400], [-PARALLAX.midFront.mouseMultiplier * PARALLAX.mouseIntensity.x, PARALLAX.midFront.mouseMultiplier * PARALLAX.mouseIntensity.x]);
    const midY = useTransform(springY, [-400, 400], [-PARALLAX.midFront.mouseMultiplier * PARALLAX.mouseIntensity.y, PARALLAX.midFront.mouseMultiplier * PARALLAX.mouseIntensity.y]);
    const fgX = useTransform(springX, [-400, 400], [PARALLAX.fg.mouseMultiplier * 8, -PARALLAX.fg.mouseMultiplier * 8]);
    const fgY = useTransform(springY, [-400, 400], [PARALLAX.fg.mouseMultiplier * 6, -PARALLAX.fg.mouseMultiplier * 6]);

    // Scroll-based parallax for video
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end start"],
    });
    const videoScale = useTransform(scrollYProgress, [0, 1], [1.05, 1.2]);
    const videoOpacity = useTransform(scrollYProgress, [0, 0.8], [0.55, 0.2]);

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect) return;
        rawX.set(e.clientX - rect.left - rect.width / 2);
        rawY.set(e.clientY - rect.top - rect.height / 2);
    }, [rawX, rawY]);

    const handleMouseLeave = useCallback(() => { rawX.set(0); rawY.set(0); }, [rawX, rawY]);

    return (
        <section
            id="hero"
            ref={containerRef}
            className="relative flex h-screen min-h-[700px] flex-col items-center justify-center overflow-hidden"
            style={{ background: DEEP }}
            onMouseMove={!mobile ? handleMouseMove : undefined}
            onMouseLeave={!mobile ? handleMouseLeave : undefined}
        >
            {/* ── Layer 0 (Background): Red Orb Video ────────────── */}
            <motion.div
                className="absolute inset-0 z-0 overflow-hidden"
                style={{
                    x: bgX,
                    y: bgY,
                    scale: videoScale,
                    ...GPU_STYLE,
                }}
            >
                <motion.video
                    src={redOrb}
                    autoPlay muted loop playsInline preload="auto"
                    className="h-full w-full object-cover"
                    style={{
                        filter: "brightness(0.55) contrast(1.1) saturate(1.3) hue-rotate(180deg)",
                        opacity: videoOpacity,
                        ...GPU_STYLE,
                    }}
                />
            </motion.div>

            {/* ── Layer 1: Gradient overlays ──────────────────────── */}
            <div className="pointer-events-none absolute inset-0 z-[1]"
                style={{ background: `rgba(1,16,35,0.35)` }} />
            <div className="pointer-events-none absolute inset-x-0 top-0 z-[2]"
                style={{ height: "40%", background: `linear-gradient(to bottom, rgba(1,16,35,0.90) 0%, transparent 100%)` }} />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[2]"
                style={{ height: "50%", background: `linear-gradient(to top, rgba(1,16,35,0.97) 0%, rgba(1,16,35,0.50) 60%, transparent 100%)` }} />
            <div className="pointer-events-none absolute inset-0 z-[2]"
                style={{ background: "radial-gradient(ellipse at 50% 50%, transparent 35%, rgba(1,16,35,0.65) 100%)" }} />

            {/* ── Layer 2 (Midground): Glow pulse ────────────────── */}
            <motion.div className="absolute inset-0 z-[3] flex items-center justify-center" style={{ x: midX, y: midY, ...GPU_STYLE }}>
                <GlowPulse />
            </motion.div>

            {/* ── Layer 2.5: 3D Canvas (midground) ───────────────── */}
            {!mobile && (
                <motion.div
                    className="absolute inset-0 z-[4] pointer-events-none"
                    style={{ x: midX, y: midY, ...GPU_STYLE }}
                >
                    <div className="absolute inset-0" style={{ opacity: 0.5 }}>
                        <Suspense fallback={null}>
                            <Hero3DCanvas mouseX={rawX.get()} mouseY={rawY.get()} />
                        </Suspense>
                    </div>
                </motion.div>
            )}

            {/* ── Layer 3: Floating UI Panels (depth layer) ──────── */}
            <motion.div
                className="absolute inset-0 z-[5] pointer-events-none overflow-hidden"
                style={{ x: fgX, y: fgY, ...GPU_STYLE }}
            >
                <FloatingPanel label="Focus Score" value="87" sub="↑ 12pts today" delay={0} x={-32} y={-18} />
                <FloatingPanel label="Streak" value="14d" sub="Personal best" delay={0.15} x={28} y={22} />
                <FloatingPanel label="Peak Hour" value="9 AM" sub="Deep work zone" delay={0.3} x={-28} y={20} />
            </motion.div>

            {/* ── Layer 4 (Foreground): Text Content ─────────────── */}
            <div className="relative z-10 text-center px-6 select-none">

                {/* Eyebrow label */}
                <motion.div
                    className="mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-1.5"
                    style={{ borderColor: `${ACCENT}55`, background: `rgba(5,37,88,0.6)` }}
                    initial={{ opacity: 0, y: -16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.7 }}
                >
                    <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: HIGHLIGHT }} />
                    <span className="text-[10px] font-bold uppercase tracking-[0.45em]" style={{ color: HIGHLIGHT }}>
                        Productivity Intelligence
                    </span>
                </motion.div>

                {/* FLOW. — giant, ultra-bold */}
                <motion.div style={{ x: fgX, y: fgY, ...GPU_STYLE }}>
                    <motion.h1
                        className="font-display font-black leading-[0.88] tracking-[-0.04em] text-white"
                        style={{
                            fontSize: "clamp(72px, 14vw, 180px)",
                            textShadow: `0 0 120px rgba(124,159,201,0.12)`,
                        }}
                        initial={{ opacity: 0, y: 60 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 1.0, ease: EASE_SMOOTH as unknown as number[] }}
                    >
                        FLOW.
                    </motion.h1>
                </motion.div>

                {/* INTELLIGENCE — thin, tracking, gradient */}
                <motion.div style={{ x: midX, y: midY, ...GPU_STYLE }}>
                    <motion.h2
                        className="font-display font-extralight leading-none tracking-[0.18em]"
                        style={{
                            fontSize: "clamp(20px, 4.5vw, 58px)",
                            background: `linear-gradient(90deg, ${HIGHLIGHT} 0%, ${ACCENT} 100%)`,
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            letterSpacing: "0.18em",
                        }}
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.35, duration: 1.0, ease: EASE_SMOOTH as unknown as number[] }}
                    >
                        INTELLIGENCE
                    </motion.h2>
                </motion.div>

                {/* Sub-copy */}
                <motion.p
                    className="mt-7 text-sm font-light leading-relaxed max-w-md mx-auto"
                    style={{ color: `${HIGHLIGHT}99`, letterSpacing: "0.03em" }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6, duration: 0.8 }}
                >
                    Cross-device productivity tracking for students<br />who mean business. Real-time · Private · Free.
                </motion.p>

                {/* CTAs */}
                <motion.div
                    className="mt-10 flex flex-wrap justify-center gap-4"
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8, duration: 0.6 }}
                >
                    <Link to="/login"
                        className="group relative overflow-hidden rounded-full px-9 py-4 text-sm font-bold uppercase tracking-[0.14em] text-white"
                        style={{
                            background: `linear-gradient(135deg, ${ACCENT}, ${HIGHLIGHT})`,
                            boxShadow: `0 0 40px ${ACCENT}35`,
                        }}
                    >
                        <span className="absolute inset-0 -translate-x-full bg-white/15 skew-x-12 transition-transform duration-500 group-hover:translate-x-full" />
                        Get Started
                    </Link>
                    <a href="#manifesto"
                        className="rounded-full border px-9 py-4 text-sm font-medium uppercase tracking-[0.14em] text-white/60 backdrop-blur-sm transition-all hover:text-white hover:border-white/40"
                        style={{ borderColor: `${ACCENT}55`, background: "rgba(1,16,35,0.4)" }}
                    >
                        See How It Works ↓
                    </a>
                </motion.div>
            </div>

            {/* ── Scroll indicator ─────────────────────────────────── */}
            <motion.div
                className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.3, duration: 0.6 }}
            >
                <span className="text-[9px] uppercase tracking-[0.5em]" style={{ color: `${ACCENT}60` }}>Scroll</span>
                <motion.div
                    className="h-8 w-px"
                    style={{ background: `linear-gradient(to bottom, ${ACCENT}55, transparent)` }}
                    animate={{ scaleY: [1, 0.4, 1], opacity: [0.5, 0.15, 0.5] }}
                    transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                />
            </motion.div>
        </section>
    );
}
