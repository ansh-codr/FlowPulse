import { useCallback, useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Link } from "react-router-dom";
import redOrb from "../../../assets/redorb.mp4";

// ─── Color constants (strict brand palette) ──────────────────────────
const ACCENT = "#527FB0";
const HIGHLIGHT = "#7C9FC9";
const DEEP = "#011023";

export function HeroScene() {
    const containerRef = useRef<HTMLDivElement>(null);

    // Parallax on mouse move
    const rawX = useMotionValue(0);
    const rawY = useMotionValue(0);
    const springX = useSpring(rawX, { stiffness: 35, damping: 20 });
    const springY = useSpring(rawY, { stiffness: 35, damping: 20 });

    // Two depth layers
    const tx1 = useTransform(springX, [-400, 400], [-16, 16]);
    const ty1 = useTransform(springY, [-400, 400], [-12, 12]);
    const tx2 = useTransform(springX, [-400, 400], [10, -10]);
    const ty2 = useTransform(springY, [-400, 400], [7, -7]);

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
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
        >
            {/* ── Red Orb Video Background ─────────────────────────────── */}
            <div className="absolute inset-0 z-0 overflow-hidden">
                <video
                    src={redOrb}
                    autoPlay muted loop playsInline preload="auto"
                    className="h-full w-full object-cover"
                    style={{
                        filter: "brightness(0.55) contrast(1.1) saturate(1.3) hue-rotate(180deg)",
                        transform: "scale(1.05)",
                        willChange: "transform",
                    }}
                />
            </div>

            {/* ── Overlay Stack ─────────────────────────────────────────── */}
            {/* Base tint — deep brand color */}
            <div className="pointer-events-none absolute inset-0 z-[1]"
                style={{ background: `rgba(1,16,35,0.35)` }} />

            {/* Top gradient */}
            <div className="pointer-events-none absolute inset-x-0 top-0 z-[2]"
                style={{ height: "40%", background: `linear-gradient(to bottom, rgba(1,16,35,0.90) 0%, transparent 100%)` }} />

            {/* Bottom gradient */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[2]"
                style={{ height: "50%", background: `linear-gradient(to top, rgba(1,16,35,0.97) 0%, rgba(1,16,35,0.50) 60%, transparent 100%)` }} />

            {/* Radial vignette */}
            <div className="pointer-events-none absolute inset-0 z-[2]"
                style={{ background: "radial-gradient(ellipse at 50% 50%, transparent 35%, rgba(1,16,35,0.65) 100%)" }} />

            {/* Subtle accent glow around orb center */}
            <div className="pointer-events-none absolute inset-0 z-[2]"
                style={{ background: `radial-gradient(ellipse 40% 40% at 50% 50%, rgba(82,127,176,0.08) 0%, transparent 70%)` }} />

            {/* ── Text Content ──────────────────────────────────────────── */}
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
                <motion.div style={{ x: tx1, y: ty1 }}>
                    <motion.h1
                        className="font-display font-black leading-[0.88] tracking-[-0.04em] text-white"
                        style={{ fontSize: "clamp(72px, 14vw, 180px)", textShadow: `0 0 120px rgba(124,159,201,0.12)` }}
                        initial={{ opacity: 0, y: 60 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
                    >
                        FLOW.
                    </motion.h1>
                </motion.div>

                {/* INTELLIGENCE — thin, tracking, gradient */}
                <motion.div style={{ x: tx2, y: ty2 }}>
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
                        transition={{ delay: 0.35, duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
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
                        style={{ background: `linear-gradient(135deg, ${ACCENT}, ${HIGHLIGHT})` }}
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

            {/* ── Scroll indicator ─────────────────────────────────────── */}
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
