import { useCallback, useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Link } from "react-router-dom";
import heroBg from "../../../assets/videos/2026-03-02T04-08-39_ultra_cinematic_watermarked.mp4";

export function HeroScene() {
    const containerRef = useRef<HTMLDivElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);

    // Mouse tracking for subtle text parallax
    const rawX = useMotionValue(0);
    const rawY = useMotionValue(0);
    const springX = useSpring(rawX, { stiffness: 40, damping: 22 });
    const springY = useSpring(rawY, { stiffness: 40, damping: 22 });

    // Two depth layers on text
    const textY1 = useTransform(springY, [-300, 300], [-14, 14]);
    const textX1 = useTransform(springX, [-300, 300], [-10, 10]);
    const textY2 = useTransform(springY, [-300, 300], [9, -9]);
    const textX2 = useTransform(springX, [-300, 300], [6, -6]);

    const handleMouseMove = useCallback(
        (e: React.MouseEvent) => {
            const rect = containerRef.current?.getBoundingClientRect();
            if (!rect) return;
            const cx = e.clientX - rect.left - rect.width / 2;
            const cy = e.clientY - rect.top - rect.height / 2;
            rawX.set(cx);
            rawY.set(cy);
        },
        [rawX, rawY]
    );

    const handleMouseLeave = useCallback(() => {
        rawX.set(0);
        rawY.set(0);
    }, [rawX, rawY]);

    return (
        <section
            id="hero"
            ref={containerRef}
            className="relative flex h-screen min-h-[640px] flex-col items-center justify-center overflow-hidden bg-black"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
        >
            {/* ─── Video Background ─────────────────────────────────────── */}
            <div className="absolute inset-0 z-0 overflow-hidden">
                <video
                    ref={videoRef}
                    src={heroBg}
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="auto"
                    className="h-full w-full object-cover"
                    style={{
                        // Per spec: global_brightness -15, contrast_boost +5
                        filter: "brightness(0.62) contrast(1.05) saturate(1.1)",
                        // Slow cinematic pan: left-to-right via transform animation
                        willChange: "transform",
                        transform: "scale(1.08)",
                        animation: "heroPan 40s ease-in-out infinite alternate",
                    }}
                />
            </div>

            {/* ─── Watermark kill strip ──────────────────────────────────
                Luma adds a small watermark bottom-right. We cover it with
                a matching dark gradient bar that blends seamlessly with the
                bottom vignette below.
            */}
            <div
                className="pointer-events-none absolute bottom-0 right-0 z-[3]"
                style={{
                    width: "260px",
                    height: "56px",
                    background: "linear-gradient(135deg, transparent 0%, rgba(0,0,0,0.92) 50%, #000 100%)",
                }}
            />

            {/* ─── Overlay stack ─────────────────────────────────────────
                Layer 1: dark base tint (opacity 0.30 per spec)
                Layer 2: vignette + top/bottom safe-zone gradients
                Layer 3: radial centre highlight so text area stays bright
            */}

            {/* Base dark overlay - background_dark_overlay_opacity: 0.30 */}
            <div
                className="pointer-events-none absolute inset-0 z-[1]"
                style={{ background: "rgba(0,0,0,0.30)" }}
            />

            {/* Top gradient: dark_gradient_top 0.35 */}
            <div
                className="pointer-events-none absolute inset-x-0 top-0 z-[2]"
                style={{
                    height: "38%",
                    background: "linear-gradient(to bottom, rgba(0,0,0,0.80) 0%, transparent 100%)",
                }}
            />

            {/* Bottom vignette: dark_gradient_bottom 0.45 */}
            <div
                className="pointer-events-none absolute inset-x-0 bottom-0 z-[2]"
                style={{
                    height: "48%",
                    background: "linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.45) 55%, transparent 100%)",
                }}
            />

            {/* Side vignette (vignette_strength 0.25) */}
            <div
                className="pointer-events-none absolute inset-0 z-[2]"
                style={{
                    background: "radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(0,0,0,0.55) 100%)",
                }}
            />

            {/* ─── Text Content ─────────────────────────────────────────── */}
            <div className="relative z-10 text-center px-4">
                {/* UNDERSTAND — bold, white, layer 1 */}
                <motion.div style={{ y: textY1, x: textX1 }}>
                    <motion.h1
                        className="font-display font-black leading-none tracking-[-0.03em] text-white drop-shadow-[0_4px_32px_rgba(0,0,0,0.9)]"
                        style={{ fontSize: "clamp(58px, 10.5vw, 128px)" }}
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                    >
                        UNDERSTAND
                    </motion.h1>
                </motion.div>

                {/* YOUR FOCUS — thin, gradient, layer 2 */}
                <motion.div style={{ y: textY2, x: textX2 }}>
                    <motion.h1
                        className="font-display font-thin leading-none tracking-[0.07em] drop-shadow-[0_4px_40px_rgba(88,240,255,0.25)]"
                        style={{
                            fontSize: "clamp(58px, 10.5vw, 128px)",
                            background: "linear-gradient(135deg, #58f0ff 0%, #9c6bff 55%, #58f0ff 100%)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                        }}
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.22, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                    >
                        YOUR FOCUS
                    </motion.h1>
                </motion.div>

                {/* Sub-line */}
                <motion.p
                    className="mt-6 text-[11px] uppercase tracking-[0.6em] text-white/40"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6, duration: 0.8 }}
                    style={{ textShadow: "0 2px 12px rgba(0,0,0,0.8)" }}
                >
                    Productivity Intelligence &nbsp;·&nbsp; Cross-Device &nbsp;·&nbsp; Real-Time
                </motion.p>

                {/* CTAs */}
                <motion.div
                    className="mt-10 flex justify-center gap-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.78, duration: 0.6 }}
                >
                    <Link
                        to="/login"
                        className="group relative overflow-hidden rounded-full px-8 py-3.5 text-sm font-bold uppercase tracking-[0.15em] text-black"
                        style={{ background: "linear-gradient(135deg, #58f0ff, #9c6bff)" }}
                    >
                        <span className="absolute inset-0 -translate-x-full bg-white/20 transition-transform duration-500 skew-x-12 group-hover:translate-x-full" />
                        Get Started
                    </Link>
                    <a
                        href="#pinned"
                        className="rounded-full border border-white/25 px-8 py-3.5 text-sm font-medium uppercase tracking-[0.15em] text-white/65 backdrop-blur-sm transition hover:border-white/50 hover:text-white"
                        style={{ background: "rgba(0,0,0,0.25)" }}
                    >
                        Explore ↓
                    </a>
                </motion.div>
            </div>

            {/* ─── Scroll indicator ──────────────────────────────────────── */}
            <motion.div
                className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2, duration: 0.6 }}
            >
                <span className="text-[9px] uppercase tracking-[0.5em] text-white/25"
                    style={{ textShadow: "0 1px 8px rgba(0,0,0,0.9)" }}>
                    Scroll
                </span>
                <motion.div
                    className="h-8 w-px bg-gradient-to-b from-white/35 to-transparent"
                    animate={{ scaleY: [1, 0.4, 1], opacity: [0.5, 0.15, 0.5] }}
                    transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                />
            </motion.div>
        </section>
    );
}
