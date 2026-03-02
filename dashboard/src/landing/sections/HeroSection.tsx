import { useRef } from "react";
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import { Link } from "react-router-dom";
import { ParticleCanvas } from "../ParticleCanvas";

const WORDS = ["Understand", "Your", "Focus.", "Optimize", "Your", "Life."];

// Mock dashboard data for the 3D hero card
const mockBars = [35, 60, 45, 80, 55, 90, 72, 88, 65, 78, 92, 70];
const mockFocus = 82;

function HeroMockup() {
    return (
        <div
            className="w-full rounded-2xl border border-white/10 p-4 shadow-[0_40px_80px_rgba(0,0,0,0.6)]"
            style={{
                background: "rgba(8,10,20,0.85)",
                backdropFilter: "blur(20px)",
            }}
        >
            {/* Mock header */}
            <div className="mb-3 flex items-center justify-between">
                <div>
                    <p className="text-[10px] uppercase tracking-[0.4em] text-white/30">Today</p>
                    <p className="font-display text-sm font-semibold text-white">Command Center</p>
                </div>
                <div className="flex gap-1.5">
                    <div className="h-2 w-2 rounded-full bg-ember/60" />
                    <div className="h-2 w-2 rounded-full bg-gold/60" />
                    <div className="h-2 w-2 rounded-full bg-success/60" />
                </div>
            </div>

            {/* Mock KPI row */}
            <div className="mb-3 grid grid-cols-3 gap-2">
                {[
                    { label: "Focus Score", value: "82%", color: "#7C9FC9" },
                    { label: "Sessions", value: "14", color: "#527FB0" },
                    { label: "Streak", value: "7d", color: "#7C9FC9" },
                ].map((kpi) => (
                    <div key={kpi.label} className="rounded-xl border border-white/[0.06] bg-white/[0.04] p-2">
                        <p className="text-[9px] uppercase tracking-wider text-white/30">{kpi.label}</p>
                        <p className="font-display text-lg font-bold" style={{ color: kpi.color }}>{kpi.value}</p>
                    </div>
                ))}
            </div>

            {/* Mock chart */}
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.04] p-3">
                <p className="mb-2 text-[10px] text-white/30">Focus Altitude</p>
                <div className="flex items-end gap-1 h-16">
                    {mockBars.map((h, i) => (
                        <motion.div
                            key={i}
                            className="flex-1 rounded-sm"
                            style={{
                                background: "linear-gradient(to top, rgba(82,127,176,0.8), rgba(124,159,201,0.8))",
                            }}
                            initial={{ height: 0 }}
                            animate={{ height: `${h}%` }}
                            transition={{ delay: 0.5 + i * 0.06, duration: 0.6, ease: "easeOut" }}
                        />
                    ))}
                </div>
            </div>

            {/* Mock focus ring row */}
            <div className="mt-3 flex items-center gap-3">
                {/* Mini ring */}
                <div className="relative h-14 w-14 flex-shrink-0">
                    <svg className="h-full w-full -rotate-90" viewBox="0 0 56 56">
                        <circle cx="28" cy="28" r="22" stroke="rgba(255,255,255,0.06)" strokeWidth="6" fill="none" />
                        <motion.circle
                            cx="28" cy="28" r="22"
                            stroke="url(#heroGrad)"
                            strokeWidth="6"
                            strokeLinecap="round"
                            fill="none"
                            initial={{ strokeDashoffset: 138 }}
                            animate={{ strokeDashoffset: 138 - (mockFocus / 100) * 138 }}
                            transition={{ delay: 1, duration: 1.2, ease: "easeOut" }}
                            style={{ strokeDasharray: 138 }}
                        />
                        <defs>
                            <linearGradient id="heroGrad" x1="0" y1="0" x2="1" y2="0">
                                <stop offset="0%" stopColor="#7C9FC9" />
                                <stop offset="100%" stopColor="#527FB0" />
                            </linearGradient>
                        </defs>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="font-display text-sm font-bold text-white">{mockFocus}%</span>
                    </div>
                </div>
                <div className="flex-1 space-y-1.5">
                    {[
                        { label: "Productivity", pct: 78, color: "#7C9FC9" },
                        { label: "Distraction", pct: 22, color: "#527FB0" },
                    ].map((bar) => (
                        <div key={bar.label}>
                            <div className="mb-0.5 flex justify-between text-[9px] text-white/30">
                                <span>{bar.label}</span><span>{bar.pct}%</span>
                            </div>
                            <div className="h-1 rounded-full bg-white/[0.06]">
                                <motion.div
                                    className="h-1 rounded-full"
                                    style={{ background: bar.color }}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${bar.pct}%` }}
                                    transition={{ delay: 1.2, duration: 0.8, ease: "easeOut" }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export function HeroSection() {
    const containerRef = useRef<HTMLDivElement>(null);
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const rotateX = useSpring(useTransform(mouseY, [-300, 300], [12, -12]), { stiffness: 150, damping: 30 });
    const rotateY = useSpring(useTransform(mouseX, [-300, 300], [-12, 12]), { stiffness: 150, damping: 30 });

    function handleMouseMove(e: React.MouseEvent) {
        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect) return;
        mouseX.set(e.clientX - rect.left - rect.width / 2);
        mouseY.set(e.clientY - rect.top - rect.height / 2);
    }

    function handleMouseLeave() {
        mouseX.set(0);
        mouseY.set(0);
    }

    return (
        <section
            className="relative flex min-h-screen items-center overflow-hidden"
            id="hero"
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
        >
            {/* Particle canvas */}
            <ParticleCanvas />

            {/* Deep gradient layers */}
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute left-1/4 top-1/4 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-plasma/20 blur-[120px]" />
                <div className="absolute right-1/4 bottom-1/4 h-[500px] w-[500px] rounded-full bg-aurora/15 blur-[100px]" />
                <div className="absolute right-1/3 top-1/2 h-[300px] w-[300px] rounded-full bg-neon/10 blur-[80px]" />
            </div>

            <div className="relative z-10 mx-auto w-full max-w-7xl px-8 pt-24">
                <div className="grid items-center gap-16 lg:grid-cols-2">
                    {/* Left — Headline + CTA */}
                    <div>
                        {/* Badge */}
                        <motion.div
                            className="mb-6 inline-flex items-center gap-2 rounded-full border border-neon/20 bg-neon/[0.06] px-4 py-1.5 text-xs font-medium text-neon"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <span className="h-1.5 w-1.5 animate-pulse-glow rounded-full bg-neon shadow-glow-neon" />
                            Productivity Intelligence for Students
                        </motion.div>

                        {/* Headline — word by word */}
                        <h1 className="mb-6 font-display text-5xl font-bold leading-[1.1] tracking-tight text-white lg:text-6xl">
                            {WORDS.map((word, i) => (
                                <motion.span
                                    key={i}
                                    className={`inline-block mr-3 ${word.includes(".") ? "block mt-2" : ""}`}
                                    style={
                                        word === "Focus." || word === "Life."
                                            ? {
                                                background: "linear-gradient(135deg, #7C9FC9, #527FB0)",
                                                WebkitBackgroundClip: "text",
                                                WebkitTextFillColor: "transparent",
                                            }
                                            : {}
                                    }
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 + i * 0.1, duration: 0.5, ease: "easeOut" }}
                                >
                                    {word}
                                </motion.span>
                            ))}
                        </h1>

                        <motion.p
                            className="mb-8 max-w-md text-lg leading-relaxed text-white/50"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.8, duration: 0.5 }}
                        >
                            FlowPulse tracks your device activity, computes a real-time focus score, and delivers
                            insights that help you study smarter — not harder.
                        </motion.p>

                        {/* CTAs */}
                        <motion.div
                            className="flex flex-wrap gap-3"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1, duration: 0.5 }}
                        >
                            <Link
                                to="/login"
                                className="group relative overflow-hidden rounded-xl px-7 py-3.5 text-sm font-semibold text-white shadow-glow-neon"
                                style={{
                                    background: "linear-gradient(135deg, rgba(124,159,201,0.3), rgba(82,127,176,0.25))",
                                    border: "1px solid rgba(124,159,201,0.4)",
                                }}
                            >
                                <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/[0.12] to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                                Get Started — Free
                            </Link>
                            <a
                                href="#how-it-works"
                                className="flex items-center gap-2 rounded-xl border border-white/[0.10] bg-white/[0.04] px-7 py-3.5 text-sm font-medium text-white/70 transition hover:bg-white/[0.08] hover:text-white"
                            >
                                See How It Works
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                </svg>
                            </a>
                        </motion.div>

                        {/* Social proof */}
                        <motion.div
                            className="mt-8 flex items-center gap-3 text-sm text-white/30"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1.2 }}
                        >
                            <div className="flex -space-x-2">
                                {["#7C9FC9", "#527FB0", "#7C9FC9", "#7C9FC9"].map((c, i) => (
                                    <div key={i} className="h-7 w-7 rounded-full border-2 border-night" style={{ background: `${c}44` }} />
                                ))}
                            </div>
                            <span>Join <strong className="text-white/60">2,400+</strong> students already in flow</span>
                        </motion.div>
                    </div>

                    {/* Right — 3D Floating mockup */}
                    <motion.div
                        className="relative hidden lg:block"
                        initial={{ opacity: 0, x: 60 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
                        style={{ perspective: 1000 }}
                    >
                        <motion.div
                            style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
                            className="relative"
                        >
                            {/* Glow behind card */}
                            <div className="absolute inset-4 rounded-3xl bg-gradient-to-br from-plasma/40 to-aurora/30 blur-2xl" />
                            <HeroMockup />

                            {/* Floating badge top-right */}
                            <motion.div
                                className="absolute -right-4 -top-4 rounded-2xl border border-neon/20 bg-night/90 px-3 py-2 shadow-glow-neon backdrop-blur-xl"
                                animate={{ y: [0, -8, 0] }}
                                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                            >
                                <p className="text-[10px] text-white/40">Focus Score</p>
                                <p className="font-display text-xl font-bold text-neon">82%</p>
                            </motion.div>

                            {/* Floating badge bottom-left */}
                            <motion.div
                                className="absolute -bottom-4 -left-4 rounded-2xl border border-aurora/20 bg-night/90 px-3 py-2 backdrop-blur-xl"
                                animate={{ y: [0, 8, 0] }}
                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                            >
                                <p className="text-[10px] text-white/40">7-day streak 🔥</p>
                                <p className="font-display text-base font-bold text-aurora">On a roll!</p>
                            </motion.div>
                        </motion.div>
                    </motion.div>
                </div>
            </div>

            {/* Scroll hint */}
            <motion.div
                className="absolute bottom-8 left-1/2 -translate-x-1/2"
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
            >
                <div className="flex h-10 w-6 items-start justify-center rounded-full border border-white/20 pt-1.5">
                    <motion.div
                        className="h-2 w-0.5 rounded-full bg-white/50"
                        animate={{ height: ["8px", "4px", "8px"] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                    />
                </div>
            </motion.div>
        </section>
    );
}
