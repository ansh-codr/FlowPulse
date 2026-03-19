import { useCallback, useRef, useState } from "react";
import { motion, useMotionValue, useMotionValueEvent, useSpring, useTransform, useScroll } from "framer-motion";
import { Link } from "react-router-dom";
import {
    ACCENT, HIGHLIGHT, EASE_SMOOTH, PARALLAX, GPU_STYLE, isMobile,
} from "../motionConfig";

const REDORB_FRAME_MAP = import.meta.glob("../../../assets/redorb frames images/*.jpg", {
    eager: true,
    import: "default",
}) as Record<string, string>;

function byNumericFrameName(a: string, b: string) {
    const getNum = (v: string) => {
        const m = v.match(/(\d+)(?=\.jpg$)/i);
        return m ? Number(m[1]) : 0;
    };
    return getNum(a) - getNum(b);
}

const REDORB_FRAMES = Object.entries(REDORB_FRAME_MAP)
    .sort((a, b) => byNumericFrameName(a[0], b[0]))
    .map(([, src]) => src);

const HERO_SCROLL_CURVE = 1.22; // >1 slows frame progression

function frameIndexForProgress(progress: number, frameCount: number, curve: number) {
    if (frameCount <= 0) return 0;
    const normalized = Math.max(0, Math.min(1, progress));
    const curved = Math.pow(normalized, curve);
    return Math.max(0, Math.min(frameCount - 1, Math.floor(curved * (frameCount - 1))));
}

// ── Floating Glass UI Panel ──────────────────────────────────────
function FloatingPanel({
    label, value, sub, delay, x, y,
}: { label: string; value: string; sub: string; delay: number; x: number; y: number }) {
    return (
        <motion.div
            className="absolute rounded-xl px-5 py-3.5 select-none pointer-events-none"
            style={{
                left: `${50 + x}%`,
                top: `${50 + y}%`,
                background: "rgba(10, 6, 4, 0.55)",
                border: "1px solid rgba(255,107,53,0.2)",
                backdropFilter: "blur(14px)",
                WebkitBackdropFilter: "blur(14px)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.6), 0 0 24px rgba(255,107,53,0.08)",
                ...GPU_STYLE,
            }}
            initial={{ opacity: 0, y: 30, scale: 0.85 }}
            animate={{ opacity: [0, 0.9], y: [30, 0], scale: [0.85, 1] }}
            transition={{ delay: delay + 0.8, duration: 1.0, ease: EASE_SMOOTH }}
        >
            <div className="text-[9px] font-bold uppercase tracking-[0.4em] mb-1" style={{ color: ACCENT }}>
                {label}
            </div>
            <div className="font-display text-xl font-black text-white leading-none">
                {value}
            </div>
            <div className="text-[10px] mt-0.5 text-white/40">
                {sub}
            </div>
        </motion.div>
    );
}

export function HeroScene() {
    const containerRef = useRef<HTMLDivElement>(null);
    const mobile = isMobile();
    const [heroFrameIndex, setHeroFrameIndex] = useState(0);

    const rawX = useMotionValue(0);
    const rawY = useMotionValue(0);
    const springX = useSpring(rawX, { stiffness: 35, damping: 20 });
    const springY = useSpring(rawY, { stiffness: 35, damping: 20 });

    const bgX = useTransform(springX, [-400, 400], [-PARALLAX.bg.mouseMultiplier * PARALLAX.mouseIntensity.x, PARALLAX.bg.mouseMultiplier * PARALLAX.mouseIntensity.x]);
    const bgY = useTransform(springY, [-400, 400], [-PARALLAX.bg.mouseMultiplier * PARALLAX.mouseIntensity.y, PARALLAX.bg.mouseMultiplier * PARALLAX.mouseIntensity.y]);
    const midX = useTransform(springX, [-400, 400], [-PARALLAX.midFront.mouseMultiplier * PARALLAX.mouseIntensity.x, PARALLAX.midFront.mouseMultiplier * PARALLAX.mouseIntensity.x]);
    const midY = useTransform(springY, [-400, 400], [-PARALLAX.midFront.mouseMultiplier * PARALLAX.mouseIntensity.y, PARALLAX.midFront.mouseMultiplier * PARALLAX.mouseIntensity.y]);
    const fgX = useTransform(springX, [-400, 400], [PARALLAX.fg.mouseMultiplier * 8, -PARALLAX.fg.mouseMultiplier * 8]);
    const fgY = useTransform(springY, [-400, 400], [PARALLAX.fg.mouseMultiplier * 6, -PARALLAX.fg.mouseMultiplier * 6]);

    const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end start"] });
    const frameScale = useTransform(scrollYProgress, [0, 1], [1.03, 1.16]);
    const frameOpacity = useTransform(scrollYProgress, [0, 0.15, 0.85, 1], [0.2, 0.6, 0.7, 0.8]);

    useMotionValueEvent(scrollYProgress, "change", (latest) => {
        if (REDORB_FRAMES.length > 0) {
            const nextHero = frameIndexForProgress(latest, REDORB_FRAMES.length, HERO_SCROLL_CURVE);
            setHeroFrameIndex((prev) => (prev === nextHero ? prev : nextHero));
        }
    });

    const heroCurrentFrame = REDORB_FRAMES[heroFrameIndex] || REDORB_FRAMES[0] || "";
    const heroBaseFrame = REDORB_FRAMES[0] || "";

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
            style={{ background: "#08060A" }}
            onMouseMove={!mobile ? handleMouseMove : undefined}
            onMouseLeave={!mobile ? handleMouseLeave : undefined}
        >
            {/* ── Layer 0: red/orange visual base */}
            <motion.div
                className="absolute inset-0 z-0 overflow-hidden"
                style={{ x: bgX, y: bgY, scale: frameScale, ...GPU_STYLE }}
            >
                <img
                    src={heroBaseFrame}
                    alt=""
                    className="h-full w-full object-cover"
                    style={{ opacity: 0.55 }}
                />
            </motion.div>

            {/* ── Layer 0.5: frame-wise image sequence (changes with scroll) */}
            <motion.div
                className="pointer-events-none absolute inset-0 z-[1] overflow-hidden"
                style={{ opacity: frameOpacity }}
            >
                <motion.img
                    key={heroFrameIndex}
                    src={heroCurrentFrame}
                    alt=""
                    className="h-full w-full object-cover"
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1.02 }}
                    transition={{ duration: 0.45, ease: "easeOut" }}
                    style={{ mixBlendMode: "screen", filter: "saturate(1.08) contrast(1.06)" }}
                />
            </motion.div>

            {/* ── Layer 1: Minimal dark vignette — preserves orb colors */}
            <div className="pointer-events-none absolute inset-0 z-[2]"
                style={{ background: "radial-gradient(ellipse at 50% 60%, transparent 30%, rgba(0,0,0,0.70) 100%)" }} />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[2]"
                style={{ height: "30%", background: "linear-gradient(to top, #08060A 0%, transparent 100%)" }} />
            <div className="pointer-events-none absolute inset-x-0 top-0 z-[2]"
                style={{ height: "25%", background: "linear-gradient(to bottom, rgba(8,6,10,0.85) 0%, transparent 100%)" }} />

            {/* ── Layer 2: Floating UI panels */}
            <motion.div
                className="absolute inset-0 z-[5] pointer-events-none overflow-hidden"
                style={{ x: fgX, y: fgY, ...GPU_STYLE }}
            >
                <FloatingPanel label="Focus Score" value="87" sub="↑ 12pts today" delay={0} x={-32} y={-18} />
                <FloatingPanel label="Streak" value="14d" sub="Personal best" delay={0.15} x={28} y={22} />
                <FloatingPanel label="Peak Hour" value="9 AM" sub="Deep work zone" delay={0.3} x={-28} y={20} />
            </motion.div>

            {/* ── Layer 3: Text */}
            <div className="relative z-10 mx-auto max-w-4xl rounded-2xl px-6 py-8 text-center select-none"
                style={{
                    background: "linear-gradient(180deg, rgba(8,6,10,0.52), rgba(8,6,10,0.35))",
                    backdropFilter: "blur(2px)",
                }}
            >

                {/* Eyebrow */}
                <motion.div
                    className="mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-1.5"
                    style={{ borderColor: "rgba(255,107,53,0.35)", background: "rgba(10,6,4,0.55)", backdropFilter: "blur(12px)" }}
                    initial={{ opacity: 0, y: -16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.7 }}
                >
                    <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: ACCENT }} />
                    <span className="text-[10px] font-bold uppercase tracking-[0.45em] text-white/80">
                        Productivity Intelligence
                    </span>
                </motion.div>

                {/* FLOW. */}
                <motion.div style={{ x: fgX, y: fgY, ...GPU_STYLE }}>
                    <motion.h1
                        className="font-display font-black leading-[0.88] tracking-[-0.04em] text-white"
                        style={{
                            fontSize: "clamp(72px, 14vw, 180px)",
                            textShadow: `0 0 80px rgba(255,120,50,0.25), 0 0 160px rgba(255,90,30,0.12)`,
                        }}
                        initial={{ opacity: 0, y: 60 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 1.0, ease: EASE_SMOOTH }}
                    >
                        FLOW.
                    </motion.h1>
                </motion.div>

                {/* INTELLIGENCE */}
                <motion.div style={{ x: midX, y: midY, ...GPU_STYLE }}>
                    <motion.h2
                        className="font-display font-extralight leading-none tracking-[0.18em]"
                        style={{
                            fontSize: "clamp(20px, 4.5vw, 58px)",
                            background: `linear-gradient(90deg, #fff 0%, ${ACCENT} 60%, ${HIGHLIGHT} 100%)`,
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                        }}
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.35, duration: 1.0, ease: EASE_SMOOTH }}
                    >
                        INTELLIGENCE
                    </motion.h2>
                </motion.div>

                {/* Sub-copy */}
                <motion.p
                    className="mt-7 text-sm font-light leading-relaxed max-w-md mx-auto text-white/60"
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
                            boxShadow: `0 0 40px rgba(255,107,53,0.4), 0 0 80px rgba(255,107,53,0.15)`,
                        }}
                    >
                        <span className="absolute inset-0 -translate-x-full bg-white/15 skew-x-12 transition-transform duration-500 group-hover:translate-x-full" />
                        Get Started
                    </Link>
                    <a href="#manifesto"
                        className="rounded-full border px-9 py-4 text-sm font-medium uppercase tracking-[0.14em] text-white/60 backdrop-blur-sm transition-all hover:text-white hover:border-white/30"
                        style={{ borderColor: "rgba(255,107,53,0.3)", background: "rgba(10,6,4,0.4)" }}
                    >
                        See How It Works ↓
                    </a>
                </motion.div>
            </div>

            {/* ── Scroll indicator */}
            <motion.div
                className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.3, duration: 0.6 }}
            >
                <span className="text-[9px] uppercase tracking-[0.5em] text-white/30">Scroll</span>
                <motion.div
                    className="h-8 w-px"
                    style={{ background: `linear-gradient(to bottom, rgba(255,107,53,0.5), transparent)` }}
                    animate={{ scaleY: [1, 0.4, 1], opacity: [0.5, 0.15, 0.5] }}
                    transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                />
            </motion.div>
        </section>
    );
}
