import { lazy, Suspense, useCallback, useRef, useState, useEffect } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Link } from "react-router-dom";

const Hero3DCanvas = lazy(() =>
    import("./Hero3DCanvas").then((m) => ({ default: m.Hero3DCanvas }))
);
const Hero3DFallback = lazy(() =>
    import("./Hero3DCanvas").then((m) => ({ default: m.Hero3DFallback }))
);

const isMobile = () => typeof window !== "undefined" && window.innerWidth < 768;



export function HeroScene() {
    const [mobile, setMobile] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Mouse tracking for 3D parallax
    const rawX = useMotionValue(0);
    const rawY = useMotionValue(0);
    const springX = useSpring(rawX, { stiffness: 50, damping: 20 });
    const springY = useSpring(rawY, { stiffness: 50, damping: 20 });

    // Text parallax layers
    const textY1 = useTransform(springY, [-300, 300], [-18, 18]);
    const textX1 = useTransform(springX, [-300, 300], [-12, 12]);
    const textY2 = useTransform(springY, [-300, 300], [12, -12]);
    const textX2 = useTransform(springX, [-300, 300], [8, -8]);

    // For 3D canvas raw values
    const [mouseRaw, setMouseRaw] = useState({ x: 0, y: 0 });

    useEffect(() => {
        setMobile(isMobile());
        const handler = () => setMobile(isMobile());
        window.addEventListener("resize", handler);
        return () => window.removeEventListener("resize", handler);
    }, []);

    const handleMouseMove = useCallback(
        (e: React.MouseEvent) => {
            const rect = containerRef.current?.getBoundingClientRect();
            if (!rect) return;
            const cx = e.clientX - rect.left - rect.width / 2;
            const cy = e.clientY - rect.top - rect.height / 2;
            rawX.set(cx);
            rawY.set(cy);
            setMouseRaw({ x: cx, y: cy });
        },
        [rawX, rawY]
    );

    const handleMouseLeave = useCallback(() => {
        rawX.set(0);
        rawY.set(0);
        setMouseRaw({ x: 0, y: 0 });
    }, [rawX, rawY]);

    return (
        <section
            id="hero"
            ref={containerRef}
            className="relative flex h-screen min-h-[640px] flex-col items-center justify-center overflow-hidden bg-black"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
        >
            {/* 3D Canvas — full bleed behind text */}
            <div className="absolute inset-0 z-0">
                <Suspense fallback={<div className="h-full w-full bg-black" />}>
                    {mobile ? (
                        <Hero3DFallback />
                    ) : (
                        <Hero3DCanvas mouseX={mouseRaw.x} mouseY={mouseRaw.y} />
                    )}
                </Suspense>
            </div>

            {/* Strong bottom vignette so text is legible over 3D */}
            <div className="pointer-events-none absolute inset-0 z-[1]"
                style={{ background: "radial-gradient(ellipse 120% 80% at 50% 60%, transparent 0%, rgba(0,0,0,0.7) 60%, black 100%)" }} />

            {/* Central text — layered parallax depths */}
            <div className="relative z-10 text-center">
                {/* Layer 1 — UNDERSTAND (black, bold) */}
                <motion.div style={{ y: textY1, x: textX1 }}>
                    <motion.h1
                        className="font-display font-black leading-none tracking-[-0.03em] text-white"
                        style={{ fontSize: "clamp(60px, 11vw, 130px)" }}
                        initial={{ opacity: 0, y: 60 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                    >
                        UNDERSTAND
                    </motion.h1>
                </motion.div>

                {/* Layer 2 — YOUR FOCUS (thin, gradient) */}
                <motion.div style={{ y: textY2, x: textX2 }}>
                    <motion.h1
                        className="font-display font-thin leading-none tracking-[0.08em]"
                        style={{
                            fontSize: "clamp(60px, 11vw, 130px)",
                            background: "linear-gradient(135deg, #58f0ff 0%, #9c6bff 60%, #58f0ff 100%)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                        }}
                        initial={{ opacity: 0, y: 60 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.22, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                    >
                        YOUR FOCUS
                    </motion.h1>
                </motion.div>

                {/* Sub-line */}
                <motion.p
                    className="mt-6 text-[11px] uppercase tracking-[0.6em] text-white/30"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6, duration: 0.8 }}
                >
                    Productivity Intelligence &nbsp;·&nbsp; Cross-Device &nbsp;·&nbsp; Real-Time
                </motion.p>

                {/* CTAs */}
                <motion.div
                    className="mt-10 flex justify-center gap-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8, duration: 0.6 }}
                >
                    <Link
                        to="/login"
                        className="group relative overflow-hidden rounded-full px-8 py-3.5 text-sm font-semibold uppercase tracking-[0.15em] text-black"
                        style={{ background: "linear-gradient(135deg, #58f0ff, #9c6bff)" }}
                    >
                        <span className="absolute inset-0 -translate-x-full bg-white/20 transition-transform duration-500 skew-x-12 group-hover:translate-x-full" />
                        Get Started
                    </Link>
                    <a
                        href="#pinned"
                        className="rounded-full border border-white/20 px-8 py-3.5 text-sm font-medium uppercase tracking-[0.15em] text-white/60 transition hover:border-white/40 hover:text-white"
                    >
                        Explore ↓
                    </a>
                </motion.div>
            </div>

            {/* Scroll indicator */}
            <motion.div
                className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2, duration: 0.6 }}
            >
                <span className="text-[9px] uppercase tracking-[0.5em] text-white/20">Scroll</span>
                <motion.div
                    className="h-8 w-px bg-gradient-to-b from-white/40 to-transparent"
                    animate={{ scaleY: [1, 0.4, 1], opacity: [0.6, 0.2, 0.6] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                />
            </motion.div>
        </section>
    );
}
