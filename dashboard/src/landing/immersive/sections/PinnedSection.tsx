import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion } from "framer-motion";
import { GlassPanel } from "../AnimationWrappers";
import { ACCENT, HIGHLIGHT, DEEP, GPU_STYLE } from "../motionConfig";

gsap.registerPlugin(ScrollTrigger);

const features = [
    {
        number: "01",
        eyebrow: "Activity Intelligence",
        headline: "Every App.\nEvery Minute.",
        body: "A silent Chrome extension tracks every tab, app, and domain in real-time. No browsing content is ever transmitted — only time-on-task metadata, processed on-device.",
        accent: HIGHLIGHT,
        visual: (
            <div className="relative h-64 w-full">
                <div className="space-y-2">
                    {[
                        { label: "coursera.org/learn/machine-...", type: "focus", pct: 88 },
                        { label: "notion.so/study-notes", type: "focus", pct: 72 },
                        { label: "youtube.com/watch?v=...", type: "shallow", pct: 40 },
                        { label: "instagram.com", type: "distract", pct: 15 },
                        { label: "github.com/project/src", type: "focus", pct: 95 },
                    ].map((tab, i) => (
                        <motion.div
                            key={tab.label}
                            className="flex items-center gap-3 rounded-xl px-4 py-2.5"
                            style={{
                                background: `rgba(5,37,88,0.6)`,
                                border: `1px solid ${ACCENT}20`,
                                backdropFilter: "blur(8px)",
                            }}
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            viewport={{ once: true }}
                        >
                            <span
                                className="h-2 w-2 flex-shrink-0 rounded-full"
                                style={{
                                    background: tab.type === "focus" ? HIGHLIGHT : tab.type === "shallow" ? ACCENT : `${ACCENT}88`,
                                    boxShadow: `0 0 8px ${tab.type === "focus" ? HIGHLIGHT : ACCENT}60`,
                                }}
                            />
                            <span className="flex-1 truncate font-mono text-xs text-white/40">{tab.label}</span>
                            <span className="text-xs font-bold" style={{
                                color: tab.type === "focus" ? HIGHLIGHT : tab.type === "shallow" ? ACCENT : `${ACCENT}80`
                            }}>
                                {tab.pct}%
                            </span>
                        </motion.div>
                    ))}
                </div>
            </div>
        ),
    },
    {
        number: "02",
        eyebrow: "Smart Classification",
        headline: "Intelligent\nBy Design.",
        body: "Every domain is classified into Focus, Shallow Work, or Distraction using a trained model. Override any classification and watch your score recalculate instantly.",
        accent: ACCENT,
        visual: (
            <div className="relative flex flex-wrap gap-3">
                {[
                    { label: "Focus", color: HIGHLIGHT, apps: ["GitHub", "Notion", "Coursera", "VS Code"] },
                    { label: "Shallow", color: ACCENT, apps: ["Reddit", "Twitter/X", "HN"] },
                    { label: "Distraction", color: `${ACCENT}88`, apps: ["Instagram", "TikTok", "YouTube"] },
                ].map((group) => (
                    <GlassPanel key={group.label} className="flex-1 min-w-[140px] p-4" intensity="light">
                        <div className="mb-3 flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full"
                                style={{
                                    background: group.color,
                                    boxShadow: `0 0 8px ${group.color}60`
                                }} />
                            <span className="text-[10px] uppercase tracking-[0.4em]" style={{ color: group.color }}>{group.label}</span>
                        </div>
                        {group.apps.map((app) => (
                            <motion.div
                                key={app}
                                className="mb-1.5 rounded-lg px-3 py-1.5 text-xs text-white/50 transition-all duration-200"
                                style={{
                                    background: `${DEEP}80`,
                                    border: `1px solid ${ACCENT}12`,
                                }}
                                whileHover={{
                                    x: 4,
                                    color: "rgba(255,255,255,0.9)",
                                    borderColor: `${ACCENT}40`,
                                }}
                                transition={{ duration: 0.15 }}
                            >
                                {app}
                            </motion.div>
                        ))}
                    </GlassPanel>
                ))}
            </div>
        ),
    },
    {
        number: "03",
        eyebrow: "Focus Computation",
        headline: "Your Focus,\nQuantified.",
        body: "A real-time 0–100 score synthesizes session continuity, distraction frequency, streak length, and time-of-day patterns. Compete on the weekly leaderboard.",
        accent: HIGHLIGHT,
        visual: (
            <div className="flex flex-col items-center gap-6">
                {/* Focus ring */}
                <div className="relative h-44 w-44">
                    <svg className="h-full w-full -rotate-90" viewBox="0 0 176 176">
                        <circle cx="88" cy="88" r="72" stroke={`${ACCENT}15`} strokeWidth="10" fill="none" />
                        <motion.circle
                            cx="88" cy="88" r="72"
                            stroke="url(#pinnedGrad)"
                            strokeWidth="10"
                            strokeLinecap="round"
                            fill="none"
                            style={{
                                strokeDasharray: 452,
                                filter: `drop-shadow(0 0 8px ${HIGHLIGHT}30)`,
                            }}
                            initial={{ strokeDashoffset: 452 }}
                            whileInView={{ strokeDashoffset: 452 - 0.82 * 452 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.3, duration: 1.4, ease: "easeOut" }}
                        />
                        <defs>
                            <linearGradient id="pinnedGrad" x1="0" y1="0" x2="1" y2="0">
                                <stop offset="0%" stopColor={HIGHLIGHT} />
                                <stop offset="100%" stopColor={ACCENT} />
                            </linearGradient>
                        </defs>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <p className="font-display text-5xl font-black text-white">82</p>
                        <p className="text-[10px] uppercase tracking-[0.4em] text-white/30">Focus Score</p>
                    </div>
                </div>
                <div className="grid grid-cols-3 gap-4 w-full text-center">
                    {[{ v: "7d", l: "Streak" }, { v: "4h12m", l: "Active" }, { v: "#5", l: "Rank" }].map((stat) => (
                        <GlassPanel key={stat.l} className="py-3" intensity="light">
                            <p className="font-display text-xl font-bold text-white">{stat.v}</p>
                            <p className="text-[10px] uppercase tracking-wider text-white/30">{stat.l}</p>
                        </GlassPanel>
                    ))}
                </div>
            </div>
        ),
    },
];

export function PinnedSection() {
    const containerRef = useRef<HTMLDivElement>(null);
    const panelRefs = useRef<(HTMLDivElement | null)[]>([]);

    useEffect(() => {
        const ctx = gsap.context(() => {
            const panels = panelRefs.current.filter(Boolean);
            panels.forEach((panel, i) => {
                if (i === 0) return;

                gsap.fromTo(
                    panel,
                    { opacity: 0, y: 60, scale: 0.97 },
                    {
                        opacity: 1,
                        y: 0,
                        scale: 1,
                        ease: "power3.out",
                        scrollTrigger: {
                            trigger: panel,
                            start: "top 75%",
                            end: "top 30%",
                            scrub: 0.8,
                        },
                    }
                );
            });
        }, containerRef);

        return () => ctx.revert();
    }, []);

    return (
        <section id="pinned" ref={containerRef} className="py-32" style={{ background: DEEP }}>
            {/* Section header */}
            <div className="mb-20 px-8 text-center">
                <p className="mb-3 text-[10px] uppercase tracking-[0.6em]" style={{ color: `${ACCENT}60` }}>How It Works</p>
                <h2 className="font-display font-black leading-none tracking-tight text-white"
                    style={{ fontSize: "clamp(36px,5vw,64px)" }}>
                    THREE LAYERS OF<br />
                    <span style={{
                        background: `linear-gradient(135deg,${HIGHLIGHT},${ACCENT})`,
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent"
                    }}>
                        INTELLIGENCE
                    </span>
                </h2>
            </div>

            {/* Feature blocks — alternating L/R */}
            <div className="space-y-32 px-8">
                {features.map((feat, i) => (
                    <div
                        key={feat.number}
                        ref={(el) => { panelRefs.current[i] = el; }}
                        className={`mx-auto flex max-w-6xl flex-col gap-16 lg:flex-row lg:items-center ${i % 2 === 1 ? "lg:flex-row-reverse" : ""}`}
                        style={GPU_STYLE}
                    >
                        {/* Text side */}
                        <div className="flex-1">
                            <div className="mb-4 flex items-center gap-3">
                                <span
                                    className="font-display text-5xl font-black leading-none"
                                    style={{ WebkitTextStroke: `1px ${feat.accent}`, color: "transparent" }}
                                >
                                    {feat.number}
                                </span>
                                <span className="text-[10px] uppercase tracking-[0.5em]" style={{ color: feat.accent }}>
                                    {feat.eyebrow}
                                </span>
                            </div>
                            <h3
                                className="mb-6 font-display font-black leading-none tracking-tight text-white"
                                style={{ fontSize: "clamp(36px,4vw,56px)", whiteSpace: "pre-line" }}
                            >
                                {feat.headline}
                            </h3>
                            <p className="max-w-md text-base leading-relaxed" style={{ color: `${HIGHLIGHT}60` }}>{feat.body}</p>

                            {/* Accent divider */}
                            <div className="mt-8 h-px w-12" style={{ background: feat.accent }} />
                        </div>

                        {/* Visual side */}
                        <div className="flex-1">{feat.visual}</div>
                    </div>
                ))}
            </div>
        </section>
    );
}
