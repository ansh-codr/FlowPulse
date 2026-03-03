import { useRef, useState } from "react";
import { motion, AnimatePresence, useInView, useScroll, useTransform } from "framer-motion";
import cinemaVideo from "../../../assets/videos/robin-julian-lee-pose-Video.mp4";
import { ScrollReveal, GlassPanel, TiltCard } from "../AnimationWrappers";
import { ACCENT, HIGHLIGHT, DEEP, SURFACE, EASE_SMOOTH, GPU_STYLE } from "../motionConfig";

// ── Wave Topology Chart ───────────────────────────────────────
const WAVE_STATES = {
    morning: [8, 22, 45, 68, 82, 91, 88, 75, 60, 42, 30, 18],
    afternoon: [30, 45, 55, 72, 80, 78, 85, 90, 82, 71, 60, 48],
    evening: [15, 28, 40, 55, 65, 70, 75, 80, 78, 72, 60, 40],
};
type WavePeriod = keyof typeof WAVE_STATES;

const LABELS = ["6am", "8am", "10am", "12pm", "2pm", "4pm", "6pm", "8pm", "10pm", "12am", "2am", "4am"];
const PERIODS: WavePeriod[] = ["morning", "afternoon", "evening"];
const PERIOD_LABELS: Record<WavePeriod, string> = {
    morning: "Morning Peak",
    afternoon: "Afternoon Drive",
    evening: "Evening Session",
};

function buildPath(values: number[], W: number, H: number, pad: number): string {
    const n = values.length;
    const step = (W - pad * 2) / (n - 1);
    const pts = values.map((v, i) => [pad + i * step, H - pad - (v / 100) * (H - pad * 2)]);
    let d = `M ${pts[0][0]} ${pts[0][1]}`;
    for (let i = 0; i < pts.length - 1; i++) {
        const p0 = pts[Math.max(0, i - 1)];
        const p1 = pts[i]; const p2 = pts[i + 1];
        const p3 = pts[Math.min(pts.length - 1, i + 2)];
        const cp1x = p1[0] + (p2[0] - p0[0]) / 6; const cp1y = p1[1] + (p2[1] - p0[1]) / 6;
        const cp2x = p2[0] - (p3[0] - p1[0]) / 6; const cp2y = p2[1] - (p3[1] - p1[1]) / 6;
        d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2[0]} ${p2[1]}`;
    }
    return d;
}

function buildAreaPath(values: number[], W: number, H: number, pad: number): string {
    const n = values.length;
    const step = (W - pad * 2) / (n - 1);
    const baseY = H - pad;
    const pts = values.map((v, i) => [pad + i * step, H - pad - (v / 100) * (H - pad * 2)]);
    let d = `M ${pad} ${baseY} L ${pts[0][0]} ${pts[0][1]}`;
    for (let i = 0; i < pts.length - 1; i++) {
        const p0 = pts[Math.max(0, i - 1)];
        const p1 = pts[i]; const p2 = pts[i + 1];
        const p3 = pts[Math.min(pts.length - 1, i + 2)];
        const cp1x = p1[0] + (p2[0] - p0[0]) / 6; const cp1y = p1[1] + (p2[1] - p0[1]) / 6;
        const cp2x = p2[0] - (p3[0] - p1[0]) / 6; const cp2y = p2[1] - (p3[1] - p1[1]) / 6;
        d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2[0]} ${p2[1]}`;
    }
    d += ` L ${pts[pts.length - 1][0]} ${baseY} Z`;
    return d;
}

function peakOf(values: number[]) {
    let max = -Infinity; let idx = 0;
    values.forEach((v, i) => { if (v > max) { max = v; idx = i; } });
    return idx;
}

function WaveChart() {
    const W = 640; const H = 240; const pad = 24;
    const [active, setActive] = useState<WavePeriod>("morning");

    const values = WAVE_STATES[active];
    const n = values.length;
    const step = (W - pad * 2) / (n - 1);
    const pts = values.map((v, i) => [pad + i * step, H - pad - (v / 100) * (H - pad * 2)]);
    const pkIdx = peakOf(values);
    const [pkx, pky] = pts[pkIdx];

    return (
        <div className="w-full">
            {/* Period switcher */}
            <div className="flex gap-3 mb-6">
                {PERIODS.map((p) => (
                    <button key={p} onClick={() => setActive(p)}
                        className="px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.3em] transition-all duration-300"
                        style={{
                            background: active === p ? `${ACCENT}33` : "transparent",
                            border: `1px solid ${active === p ? ACCENT : `${ACCENT}30`}`,
                            color: active === p ? HIGHLIGHT : `${ACCENT}70`,
                            boxShadow: active === p ? `0 0 16px ${ACCENT}20` : "none",
                        }}>
                        {p}
                    </button>
                ))}
            </div>

            <GlassPanel className="w-full" intensity="light" style={{ padding: 0 }}>
                <svg
                    width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none"
                    style={{ display: "block", height: "180px" }}
                >
                    <defs>
                        <linearGradient id="waveArea" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={HIGHLIGHT} stopOpacity="0.18" />
                            <stop offset="100%" stopColor={HIGHLIGHT} stopOpacity="0.01" />
                        </linearGradient>
                        <filter id="waveglow">
                            <feGaussianBlur stdDeviation="2" result="cb" />
                            <feMerge><feMergeNode in="cb" /><feMergeNode in="SourceGraphic" /></feMerge>
                        </filter>
                    </defs>

                    {/* Horizontal grid lines */}
                    {[25, 50, 75].map((pct) => {
                        const gy = H - pad - (pct / 100) * (H - pad * 2);
                        return (
                            <line key={pct} x1={pad} y1={gy} x2={W - pad} y2={gy}
                                stroke={ACCENT} strokeWidth={0.5} opacity={0.15} strokeDasharray="8 6" />
                        );
                    })}

                    {/* Area fill */}
                    <AnimatePresence mode="wait">
                        <motion.path
                            key={active + "area"}
                            d={buildAreaPath(values, W, H, pad)}
                            fill="url(#waveArea)"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.6 }}
                        />
                    </AnimatePresence>

                    {/* Wave line */}
                    <AnimatePresence mode="wait">
                        <motion.path
                            key={active + "line"}
                            d={buildPath(values, W, H, pad)}
                            fill="none"
                            stroke={HIGHLIGHT}
                            strokeWidth={2.5}
                            strokeLinecap="round"
                            filter="url(#waveglow)"
                            initial={{ pathLength: 0, opacity: 0 }}
                            animate={{ pathLength: 1, opacity: 1 }}
                            exit={{ pathLength: 0, opacity: 0 }}
                            transition={{ duration: 0.9, ease: "easeInOut" }}
                        />
                    </AnimatePresence>

                    {/* Peak indicator */}
                    <AnimatePresence mode="wait">
                        <motion.g key={active + "peak"}
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ delay: 0.7, duration: 0.4 }}
                            style={{ transformOrigin: `${pkx}px ${pky}px` }}
                        >
                            <circle cx={pkx} cy={pky} r="14" fill={SURFACE} stroke={HIGHLIGHT} strokeWidth="1.5" opacity={0.9} />
                            <text x={pkx} y={pky + 4} textAnchor="middle" fontSize="10" fontWeight="bold"
                                fill={HIGHLIGHT} fontFamily="monospace">{values[pkIdx]}</text>
                        </motion.g>
                    </AnimatePresence>

                    {/* X-axis labels */}
                    {pts.map(([px], i) => i % 2 === 0 ? (
                        <text key={i} x={px} y={H - 4} textAnchor="middle"
                            fontSize="8" fill={`${ACCENT}60`} fontFamily="monospace">
                            {LABELS[i]}
                        </text>
                    ) : null)}
                </svg>
            </GlassPanel>

            {/* Active period label */}
            <AnimatePresence mode="wait">
                <motion.p
                    key={active}
                    className="mt-3 text-[10px] uppercase tracking-[0.4em]"
                    style={{ color: `${ACCENT}70` }}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    {PERIOD_LABELS[active]}
                </motion.p>
            </AnimatePresence>
        </div>
    );
}

// ── Animated Focus Score Ring (circular indicator) ─────────────
function FocusScoreRing({ revealed }: { revealed: boolean }) {
    const score = 87;
    const circumference = 2 * Math.PI * 60;

    return (
        <div className="relative h-36 w-36 mx-auto">
            <svg className="h-full w-full -rotate-90" viewBox="0 0 140 140">
                <circle cx="70" cy="70" r="60"
                    stroke={`${ACCENT}20`} strokeWidth="8" fill="none" />
                <motion.circle
                    cx="70" cy="70" r="60"
                    stroke={HIGHLIGHT}
                    strokeWidth="8"
                    strokeLinecap="round"
                    fill="none"
                    style={{
                        strokeDasharray: circumference,
                        filter: `drop-shadow(0 0 8px ${HIGHLIGHT}40)`,
                    }}
                    initial={{ strokeDashoffset: circumference }}
                    animate={revealed ? { strokeDashoffset: circumference * (1 - score / 100) } : {}}
                    transition={{ delay: 0.5, duration: 1.4, ease: "easeOut" }}
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.span
                    className="font-display text-3xl font-black text-white"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={revealed ? { opacity: 1, scale: 1 } : {}}
                    transition={{ delay: 0.8, duration: 0.5 }}
                >
                    {score}
                </motion.span>
                <span className="text-[9px] uppercase tracking-[0.3em]" style={{ color: `${ACCENT}70` }}>
                    Focus Score
                </span>
            </div>
        </div>
    );
}

// ── Mini Leaderboard ──────────────────────────────────────────
const BOARD = [
    { rank: 1, name: "Aryan S.", score: 94 },
    { rank: 2, name: "Priya M.", score: 88 },
    { rank: 3, name: "Dev K.", score: 82 },
    { rank: 4, name: "Zara T.", score: 77 },
    { rank: 5, name: "You", score: 71, isYou: true },
];

export function DataShowcase() {
    const sRef = useRef<HTMLDivElement>(null);
    const sInView = useInView(sRef, { once: true, amount: 0.2 });

    // Scroll-synced video dimming
    const { scrollYProgress } = useScroll({ target: sRef, offset: ["start end", "end start"] });
    const videoBrightness = useTransform(scrollYProgress, [0, 0.4, 0.8], [0.06, 0.12, 0.06]);

    return (
        <section className="relative overflow-hidden py-32" style={{ background: DEEP }}>
            {/* Video bg — scroll-synced brightness */}
            <div className="pointer-events-none absolute inset-0 z-0">
                <motion.video
                    src={cinemaVideo} autoPlay muted loop playsInline
                    className="h-full w-full object-cover"
                    style={{
                        filter: `saturate(0.6)`,
                        opacity: videoBrightness,
                        transform: "scale(1.04)",
                        ...GPU_STYLE,
                    }}
                />
            </div>
            <div className="pointer-events-none absolute inset-0 z-[1]"
                style={{ background: `rgba(1,16,35,0.88)` }} />

            <div ref={sRef} className="relative z-10 mx-auto max-w-7xl px-8">
                {/* Header */}
                <ScrollReveal delay={0} direction="up">
                    <p className="text-[10px] uppercase tracking-[0.5em] mb-3" style={{ color: ACCENT }}>Live Data</p>
                    <h2 className="font-display font-black text-white mb-16" style={{ fontSize: "clamp(36px, 6vw, 72px)", lineHeight: 0.9 }}>
                        Your Focus,<br />
                        <span style={{
                            background: `linear-gradient(135deg, ${HIGHLIGHT}, ${ACCENT})`,
                            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"
                        }}>Visualised.</span>
                    </h2>
                </ScrollReveal>

                {/* 3-col layout */}
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
                    {/* Wave Chart — 7/12 */}
                    <motion.div className="lg:col-span-7"
                        initial={{ opacity: 0, x: -30 }}
                        animate={sInView ? { opacity: 1, x: 0 } : {}}
                        transition={{ delay: 0.15, duration: 0.8, ease: EASE_SMOOTH }}>
                        <WaveChart />
                    </motion.div>

                    {/* Right sidebar — 5/12 */}
                    <div className="lg:col-span-5 space-y-6">
                        {/* Focus Score Ring */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={sInView ? { opacity: 1, y: 0 } : {}}
                            transition={{ delay: 0.25, duration: 0.8 }}
                        >
                            <TiltCard>
                                <GlassPanel className="p-6 text-center">
                                    <p className="text-[9px] uppercase tracking-[0.4em] mb-4" style={{ color: ACCENT }}>
                                        Today's Focus
                                    </p>
                                    <FocusScoreRing revealed={sInView} />
                                </GlassPanel>
                            </TiltCard>
                        </motion.div>

                        {/* Mini Leaderboard */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={sInView ? { opacity: 1, y: 0 } : {}}
                            transition={{ delay: 0.35, duration: 0.8 }}
                        >
                            <TiltCard>
                                <GlassPanel className="p-6">
                                    <p className="text-[9px] uppercase tracking-[0.4em] mb-5" style={{ color: ACCENT }}>Today's Board</p>
                                    <div className="space-y-2.5">
                                        {BOARD.map((entry, i) => (
                                            <motion.div
                                                key={entry.rank}
                                                className="flex items-center gap-4 rounded-xl px-4 py-3 transition-all duration-300 hover:translate-y-[-2px]"
                                                style={{
                                                    background: entry.isYou ? `${ACCENT}25` : `${DEEP}BB`,
                                                    border: `1px solid ${entry.isYou ? ACCENT : `${ACCENT}18`}`,
                                                    boxShadow: entry.isYou ? `0 4px 16px ${ACCENT}15` : "none",
                                                }}
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={sInView ? { opacity: 1, x: 0 } : {}}
                                                transition={{ delay: 0.4 + i * 0.08, duration: 0.5, ease: EASE_SMOOTH }}
                                            >
                                                <span className="font-display text-sm font-bold w-5 text-center"
                                                    style={{ color: entry.rank === 1 ? HIGHLIGHT : `${ACCENT}80` }}>
                                                    #{entry.rank}
                                                </span>
                                                <span className="flex-1 text-sm font-medium"
                                                    style={{ color: entry.isYou ? HIGHLIGHT : "rgba(255,255,255,0.8)" }}>
                                                    {entry.name}
                                                </span>
                                                <span className="font-display font-bold text-sm" style={{ color: HIGHLIGHT }}>
                                                    {entry.score}
                                                </span>
                                            </motion.div>
                                        ))}
                                    </div>
                                </GlassPanel>
                            </TiltCard>
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    );
}
