import { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import asteroid2 from "../../../assets/dxsbond-asteroid2-2.jpg";

const ACCENT = "#527FB0";
const HIGHLIGHT = "#7C9FC9";
const DEEP = "#011023";
const SURFACE = "#052558";

const LEADERBOARD = [
    { rank: 1, name: "Aryan S.", score: 94, hours: "8.2h" },
    { rank: 2, name: "Priya M.", score: 88, hours: "7.1h" },
    { rank: 3, name: "Dev K.", score: 82, hours: "6.8h" },
    { rank: 4, name: "Zara T.", score: 77, hours: "6.0h" },
    { rank: 5, name: "Rohan V.", score: 71, hours: "5.3h" },
];

// ── Radial Pulse Leaderboard ──────────────────────────────────────────
function RadialLeaderboard() {
    const [active, setActive] = useState(0);
    const cx = 160; const cy = 155;

    // radius per rank: rank 1 closest, rank 5 furthest
    const radii = [52, 82, 108, 130, 148];
    const total = LEADERBOARD.length;
    // angles spaced evenly
    const angles = LEADERBOARD.map((_, i) => (i / total) * 2 * Math.PI - Math.PI / 2);

    useEffect(() => {
        const t = setInterval(() => setActive((a) => (a + 1) % total), 2800);
        return () => clearInterval(t);
    }, [total]);

    return (
        <div className="relative flex items-center justify-center">
            <svg width="320" height="310" viewBox="0 0 320 310">
                <defs>
                    <radialGradient id="centralGlow2" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor={HIGHLIGHT} stopOpacity="0.25" />
                        <stop offset="100%" stopColor={DEEP} stopOpacity="0" />
                    </radialGradient>
                    <filter id="glow2">
                        <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                        <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
                    </filter>
                </defs>

                {/* Concentric guide rings */}
                {radii.map((r, i) => (
                    <circle key={i} cx={cx} cy={cy} r={r}
                        fill="none" stroke={ACCENT} strokeWidth={0.5} opacity={0.15} strokeDasharray="4 6" />
                ))}

                {/* Central glow */}
                <circle cx={cx} cy={cy} r="38" fill="url(#centralGlow2)" />
                <circle cx={cx} cy={cy} r="26" fill={SURFACE} opacity={0.9} />
                <text x={cx} y={cy - 4} textAnchor="middle" fontSize="8" fill={HIGHLIGHT} fontFamily="monospace" opacity={0.9}>LIVE</text>
                <text x={cx} y={cy + 8} textAnchor="middle" fontSize="7" fill={ACCENT} fontFamily="monospace" opacity={0.7}>RANK</text>

                {/* Nodes */}
                {LEADERBOARD.map((entry, i) => {
                    const r = radii[i];
                    const ang = angles[i];
                    const nx = cx + r * Math.cos(ang);
                    const ny = cy + r * Math.sin(ang);
                    const isActive = i === active;

                    return (
                        <g key={entry.rank}>
                            {/* Pulse line to centre */}
                            <motion.line
                                x1={cx} y1={cy} x2={nx} y2={ny}
                                stroke={HIGHLIGHT} strokeWidth={isActive ? 1.5 : 0.5}
                                opacity={isActive ? 0.8 : 0.2}
                                animate={{ opacity: isActive ? [0.2, 0.8, 0.2] : 0.2 }}
                                transition={{ duration: 1.4, repeat: Infinity }}
                            />
                            {/* Travelling pulse dot */}
                            {isActive && (
                                <motion.circle
                                    cx={cx} cy={cy} r="2.5"
                                    fill={HIGHLIGHT} filter="url(#glow2)"
                                    animate={{ cx: [cx, nx, cx], cy: [cy, ny, cy], opacity: [0, 1, 0] }}
                                    transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
                                />
                            )}
                            {/* Node circle */}
                            <circle cx={nx} cy={ny} r={isActive ? 14 : 10}
                                fill={SURFACE} stroke={isActive ? HIGHLIGHT : ACCENT}
                                strokeWidth={isActive ? 2 : 1}
                                style={{ transition: "all 0.4s ease" }}
                            />
                            {/* Rank number */}
                            <text x={nx} y={ny + 4} textAnchor="middle"
                                fontSize="10" fontWeight="bold"
                                fill={isActive ? HIGHLIGHT : ACCENT}
                                fontFamily="monospace">
                                #{entry.rank}
                            </text>
                            {/* Name label outside */}
                            <text
                                x={nx + (nx > cx + 5 ? 20 : nx < cx - 5 ? -20 : 0)}
                                y={ny + (ny > cy + 5 ? 26 : ny < cy - 5 ? -20 : 4)}
                                textAnchor={nx > cx + 5 ? "start" : nx < cx - 5 ? "end" : "middle"}
                                fontSize="8" fill={isActive ? HIGHLIGHT : `${ACCENT}80`}
                                fontFamily="monospace"
                                style={{ transition: "fill 0.4s ease" }}
                            >
                                {entry.name}
                            </text>
                        </g>
                    );
                })}
            </svg>

            {/* Active entry info box */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={active}
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 rounded-xl px-5 py-3 text-center"
                    style={{ background: `${SURFACE}DD`, border: `1px solid ${ACCENT}40`, minWidth: "160px" }}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.35 }}
                >
                    <div className="font-display text-2xl font-black" style={{ color: HIGHLIGHT }}>
                        {LEADERBOARD[active].score}
                    </div>
                    <div className="text-[9px] uppercase tracking-widest" style={{ color: `${ACCENT}80` }}>
                        {LEADERBOARD[active].name} · {LEADERBOARD[active].hours}
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
    );
}

export function FeatureImageB() {
    const ref = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
    const imgY = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);

    return (
        <section ref={ref} className="relative overflow-hidden" style={{ minHeight: "100vh" }}>
            {/* Parallax image */}
            <motion.div className="absolute inset-0 z-0" style={{ y: imgY }}>
                <img
                    src={asteroid2}
                    alt=""
                    className="h-[115%] w-full object-cover object-center"
                    style={{ marginTop: "-7.5%" }}
                />
            </motion.div>

            {/* Dark overlay */}
            <div className="pointer-events-none absolute inset-0 z-[1]"
                style={{ background: `rgba(1,16,35,0.80)` }} />

            {/* Right edge glow */}
            <div className="pointer-events-none absolute inset-y-0 right-0 z-[2] w-64"
                style={{ background: `linear-gradient(to left, rgba(1,16,35,0.9), transparent)` }} />

            {/* Content — image right, text left (mirrored from A) */}
            <div className="relative z-10 mx-auto grid max-w-7xl grid-cols-1 gap-16 px-8 py-32 lg:grid-cols-2 lg:items-center">

                {/* Left — Radial Leaderboard */}
                <motion.div
                    className="flex items-center justify-center"
                    initial={{ opacity: 0, scale: 0.85 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
                >
                    <div className="relative">
                        <div className="absolute inset-0 rounded-full"
                            style={{ boxShadow: `0 0 80px 20px rgba(82,127,176,0.12)` }} />
                        <RadialLeaderboard />
                    </div>
                </motion.div>

                {/* Right — copy */}
                <motion.div
                    initial={{ opacity: 0, x: 40 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                >
                    <div
                        className="font-display font-black leading-none select-none mb-4"
                        style={{
                            fontSize: "clamp(80px, 14vw, 160px)",
                            WebkitTextStroke: `1px ${ACCENT}55`,
                            color: "transparent",
                            lineHeight: 0.85,
                        }}
                    >
                        02
                    </div>

                    <h2 className="font-display font-black text-white leading-tight mb-6"
                        style={{ fontSize: "clamp(32px, 5vw, 62px)" }}>
                        Compete With<br />
                        <span style={{
                            background: `linear-gradient(135deg, ${HIGHLIGHT}, ${ACCENT})`,
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                        }}>Yourself.</span>
                    </h2>

                    <p className="text-base leading-relaxed mb-8 max-w-sm" style={{ color: `${HIGHLIGHT}80` }}>
                        Anonymous leaderboards update every minute. See where you rank in your cohort — and watch your position climb as your focus deepens.
                    </p>

                    {["Live rank updates", "Anonymous by default", "Cohort-based scoring"].map((label) => (
                        <div key={label} className="mb-2 flex items-center gap-3">
                            <span className="h-1.5 w-1.5 rounded-full flex-shrink-0" style={{ background: HIGHLIGHT }} />
                            <span className="text-sm" style={{ color: `${HIGHLIGHT}70` }}>{label}</span>
                        </div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
