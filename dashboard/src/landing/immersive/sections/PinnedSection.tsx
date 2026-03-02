import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion } from "framer-motion";

gsap.registerPlugin(ScrollTrigger);

const features = [
    {
        number: "01",
        eyebrow: "Activity Intelligence",
        headline: "Every App.\nEvery Minute.",
        body: "A silent Chrome extension tracks every tab, app, and domain in real-time. No browsing content is ever transmitted — only time-on-task metadata, processed on-device.",
        accent: "#7C9FC9",
        visual: (
            <div className="relative h-64 w-full">
                {/* Mock browser tabs */}
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
                            className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.04] px-4 py-2.5"
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            viewport={{ once: true }}
                        >
                            <span
                                className="h-2 w-2 flex-shrink-0 rounded-full"
                                style={{
                                    background: tab.type === "focus" ? "#7C9FC9" : tab.type === "shallow" ? "#7C9FC9" : "#527FB0",
                                    boxShadow: `0 0 8px ${tab.type === "focus" ? "#7C9FC9" : tab.type === "shallow" ? "#7C9FC9" : "#527FB0"}80`,
                                }}
                            />
                            <span className="flex-1 truncate font-mono text-xs text-white/40">{tab.label}</span>
                            <span className="text-xs font-bold" style={{ color: tab.type === "focus" ? "#7C9FC9" : tab.type === "shallow" ? "#7C9FC9" : "#527FB0" }}>
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
        accent: "#527FB0",
        visual: (
            <div className="relative flex flex-wrap gap-3">
                {[
                    { label: "Focus", color: "#7C9FC9", apps: ["GitHub", "Notion", "Coursera", "VS Code"] },
                    { label: "Shallow", color: "#7C9FC9", apps: ["Reddit", "Twitter/X", "HN"] },
                    { label: "Distraction", color: "#527FB0", apps: ["Instagram", "TikTok", "YouTube"] },
                ].map((group) => (
                    <div key={group.label} className="flex-1 min-w-[140px] rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4">
                        <div className="mb-3 flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full" style={{ background: group.color, boxShadow: `0 0 8px ${group.color}80` }} />
                            <span className="text-[10px] uppercase tracking-[0.4em]" style={{ color: group.color }}>{group.label}</span>
                        </div>
                        {group.apps.map((app) => (
                            <motion.div
                                key={app}
                                className="mb-1.5 rounded-lg border border-white/[0.05] bg-white/[0.04] px-3 py-1.5 text-xs text-white/50"
                                whileHover={{ x: 4, color: "rgba(255,255,255,0.9)" }}
                                transition={{ duration: 0.15 }}
                            >
                                {app}
                            </motion.div>
                        ))}
                    </div>
                ))}
            </div>
        ),
    },
    {
        number: "03",
        eyebrow: "Focus Computation",
        headline: "Your Focus,\nQuantified.",
        body: "A real-time 0–100 score synthesizes session continuity, distraction frequency, streak length, and time-of-day patterns. Compete on the weekly leaderboard.",
        accent: "#7C9FC9",
        visual: (
            <div className="flex flex-col items-center gap-6">
                {/* Focus ring */}
                <div className="relative h-44 w-44">
                    <svg className="h-full w-full -rotate-90" viewBox="0 0 176 176">
                        <circle cx="88" cy="88" r="72" stroke="rgba(255,255,255,0.05)" strokeWidth="10" fill="none" />
                        <motion.circle
                            cx="88" cy="88" r="72"
                            stroke="url(#pinnedGrad)"
                            strokeWidth="10"
                            strokeLinecap="round"
                            fill="none"
                            style={{ strokeDasharray: 452 }}
                            initial={{ strokeDashoffset: 452 }}
                            whileInView={{ strokeDashoffset: 452 - 0.82 * 452 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.3, duration: 1.4, ease: "easeOut" }}
                        />
                        <defs>
                            <linearGradient id="pinnedGrad" x1="0" y1="0" x2="1" y2="0">
                                <stop offset="0%" stopColor="#7C9FC9" />
                                <stop offset="100%" stopColor="#7C9FC9" />
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
                        <div key={stat.l} className="rounded-xl border border-white/[0.06] bg-white/[0.03] py-3">
                            <p className="font-display text-xl font-bold text-white">{stat.v}</p>
                            <p className="text-[10px] uppercase tracking-wider text-white/30">{stat.l}</p>
                        </div>
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
                if (i === 0) return; // first panel starts visible

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
        <section id="pinned" ref={containerRef} className="bg-deep py-32">
            {/* Section header */}
            <div className="mb-20 px-8 text-center">
                <p className="mb-3 text-[10px] uppercase tracking-[0.6em] text-white/25">How It Works</p>
                <h2 className="font-display text-[clamp(36px,5vw,64px)] font-black leading-none tracking-tight text-white">
                    THREE LAYERS OF<br />
                    <span style={{ background: "linear-gradient(135deg,#7C9FC9,#527FB0)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
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
                                className="mb-6 font-display text-[clamp(36px,4vw,56px)] font-black leading-none tracking-tight text-white"
                                style={{ whiteSpace: "pre-line" }}
                            >
                                {feat.headline}
                            </h3>
                            <p className="max-w-md text-base leading-relaxed text-white/40">{feat.body}</p>

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
