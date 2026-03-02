import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const ACCENT = "#527FB0";
const HIGHLIGHT = "#7C9FC9";
const DEEP = "#011023";
const SURFACE = "#052558";

const CARDS = [
    {
        id: "01",
        label: "CAPTURE",
        title: "Every Second Counts",
        body: "Our browser extension silently records active tab time, idle gaps, and domain switches. Zero uploads — processed entirely on device.",
        visual: <CaptureVisual />,
    },
    {
        id: "02",
        label: "CLASSIFY",
        title: "Intent, Not Just Time",
        body: "A trained model assigns every domain to Focus, Shallow Work, or Distraction. Override any classification and watch your score recalculate live.",
        visual: <ClassifyVisual />,
    },
    {
        id: "03",
        label: "IMPROVE",
        title: "See Yourself Grow",
        body: "Daily score trends show exactly where your peak hours are. Compete on the leaderboard — rankings recalculate every minute.",
        visual: <ImproveVisual />,
    },
];

function CaptureVisual() {
    return (
        <div className="space-y-2 font-mono text-xs">
            {[
                { domain: "github.com", time: "42m", type: "focus" },
                { domain: "notion.so", time: "18m", type: "focus" },
                { domain: "youtube.com", time: "7m", type: "distraction" },
                { domain: "stackoverflow", time: "23m", type: "focus" },
            ].map((row, i) => (
                <motion.div
                    key={i}
                    className="flex items-center justify-between rounded px-3 py-2"
                    style={{ background: `${DEEP}CC`, border: `1px solid ${ACCENT}25` }}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.1, duration: 0.5 }}
                >
                    <span style={{ color: HIGHLIGHT }}>{row.domain}</span>
                    <div className="flex items-center gap-3">
                        <span style={{ color: `${ACCENT}80` }}>{row.time}</span>
                        <div className="h-1.5 w-1.5 rounded-full" style={{
                            background: row.type === "focus" ? HIGHLIGHT : ACCENT,
                        }} />
                    </div>
                </motion.div>
            ))}
        </div>
    );
}

function ClassifyVisual() {
    return (
        <div className="relative flex items-center justify-center py-4">
            <svg width="280" height="140" viewBox="0 0 280 140">
                {/* Trunk */}
                <motion.line x1="140" y1="20" x2="140" y2="60" stroke={ACCENT} strokeWidth="1.5"
                    initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.3, duration: 0.5 }} />
                {/* Branches */}
                {[
                    { x2: 50, label: "Focus", color: HIGHLIGHT },
                    { x2: 140, label: "Shallow", color: ACCENT },
                    { x2: 230, label: "Distraction", color: `${ACCENT}88` },
                ].map((branch, i) => (
                    <g key={i}>
                        <motion.line
                            x1="140" y1="60" x2={branch.x2} y2="95"
                            stroke={branch.color} strokeWidth="1.5"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ delay: 0.6 + i * 0.15, duration: 0.4 }}
                        />
                        <motion.rect
                            x={branch.x2 - 38} y="100" width="76" height="28" rx="4"
                            fill={SURFACE} stroke={branch.color} strokeWidth="1"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1.0 + i * 0.15 }}
                        />
                        <text x={branch.x2} y="119" textAnchor="middle"
                            fontSize="9" fill={branch.color} fontFamily="monospace">{branch.label}</text>
                    </g>
                ))}
                {/* Root node */}
                <circle cx="140" cy="15" r="8" fill={SURFACE} stroke={ACCENT} strokeWidth="1.5" />
                <text x="140" y="19" textAnchor="middle" fontSize="8" fill={HIGHLIGHT} fontFamily="monospace">URL</text>
            </svg>
        </div>
    );
}

function ImproveVisual() {
    const points = [22, 35, 28, 48, 42, 58, 55, 71, 68, 82, 78, 91];
    const w = 280; const h = 100;
    const maxV = 100;
    const pts = points.map((v, i) => `${(i / (points.length - 1)) * w},${h - (v / maxV) * h}`).join(" ");

    return (
        <div className="relative">
            <svg width="280" height="110" viewBox="0 0 280 110">
                <defs>
                    <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor={ACCENT} />
                        <stop offset="100%" stopColor={HIGHLIGHT} />
                    </linearGradient>
                    <linearGradient id="scoreArea" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={HIGHLIGHT} stopOpacity="0.25" />
                        <stop offset="100%" stopColor={HIGHLIGHT} stopOpacity="0.01" />
                    </linearGradient>
                </defs>
                {/* Area fill */}
                <motion.polygon
                    points={`0,${h} ` + pts + ` ${w},${h}`}
                    fill="url(#scoreArea)"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.8 }}
                />
                {/* Line */}
                <motion.polyline
                    points={pts}
                    fill="none" stroke="url(#scoreGrad)" strokeWidth="2.5"
                    strokeLinecap="round" strokeLinejoin="round"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ delay: 0.3, duration: 1.2, ease: "easeInOut" }}
                />
                {/* Peak dot */}
                <motion.circle
                    cx={(10 / 11) * w} cy={h - (91 / maxV) * h} r="5"
                    fill={HIGHLIGHT}
                    initial={{ scale: 0 }}
                    animate={{ scale: [0, 1.4, 1] }}
                    transition={{ delay: 1.5, duration: 0.4 }}
                />
            </svg>
            {/* Score label */}
            <div className="absolute right-0 top-0 text-right">
                <div className="font-display text-4xl font-black" style={{
                    background: `linear-gradient(135deg, ${HIGHLIGHT}, ${ACCENT})`,
                    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"
                }}>91</div>
                <div className="text-[9px] uppercase tracking-widest" style={{ color: `${ACCENT}70` }}>Focus Score</div>
            </div>
        </div>
    );
}

export function FeatureCards() {
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: true, amount: 0.1 });

    return (
        <section
            ref={ref}
            className="relative py-32 px-6 overflow-hidden"
            style={{ background: DEEP }}
        >
            {/* Dot grid texture */}
            <div className="pointer-events-none absolute inset-0"
                style={{
                    backgroundImage: `radial-gradient(circle, ${SURFACE}66 1px, transparent 1px)`,
                    backgroundSize: "32px 32px",
                }} />

            {/* Section header */}
            <div className="mx-auto max-w-7xl mb-20">
                <motion.p
                    className="text-[10px] uppercase tracking-[0.5em] mb-3"
                    style={{ color: ACCENT }}
                    initial={{ opacity: 0 }}
                    animate={isInView ? { opacity: 1 } : {}}
                    transition={{ duration: 0.6 }}
                >
                    How It Works
                </motion.p>
                <motion.h2
                    className="font-display font-black text-white"
                    style={{ fontSize: "clamp(36px, 6vw, 72px)", lineHeight: 0.9 }}
                    initial={{ opacity: 0, y: 30 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ delay: 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                >
                    Three Steps.<br />
                    <span style={{
                        WebkitTextStroke: `1px ${ACCENT}`,
                        color: "transparent",
                    }}>
                        Total Clarity.
                    </span>
                </motion.h2>
            </div>

            {/* Cards grid */}
            <div className="mx-auto max-w-7xl grid grid-cols-1 gap-6 md:grid-cols-3">
                {CARDS.map((card, i) => (
                    <motion.div
                        key={card.id}
                        className="relative rounded-2xl p-8 overflow-hidden"
                        style={{
                            background: `${SURFACE}CC`,
                            border: `1px solid ${ACCENT}30`,
                            backdropFilter: "blur(16px)",
                        }}
                        initial={{ opacity: 0, y: 50 }}
                        animate={isInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ delay: 0.2 + i * 0.12, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                        whileHover={{ y: -6, transition: { duration: 0.3 } }}
                    >
                        {/* Accent corner glow */}
                        <div className="pointer-events-none absolute top-0 right-0 w-32 h-32 rounded-bl-full"
                            style={{ background: `radial-gradient(circle at top right, ${ACCENT}22, transparent 70%)` }} />

                        {/* Card number */}
                        <div className="mb-6 font-display text-5xl font-black leading-none select-none"
                            style={{ WebkitTextStroke: `1px ${ACCENT}60`, color: "transparent" }}>
                            {card.id}
                        </div>

                        {/* Visual */}
                        <div className="mb-6 min-h-[120px]">
                            {card.visual}
                        </div>

                        {/* Label */}
                        <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.4em]" style={{ color: ACCENT }}>
                            {card.label}
                        </div>
                        <h3 className="font-display text-xl font-bold text-white mb-3">{card.title}</h3>
                        <p className="text-sm leading-relaxed" style={{ color: `${HIGHLIGHT}70` }}>{card.body}</p>

                        {/* Bottom accent line */}
                        <div className="absolute bottom-0 inset-x-0 h-px"
                            style={{ background: `linear-gradient(90deg, transparent, ${ACCENT}55, transparent)` }} />
                    </motion.div>
                ))}
            </div>
        </section>
    );
}
