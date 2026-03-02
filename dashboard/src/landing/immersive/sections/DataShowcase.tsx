import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion, AnimatePresence } from "framer-motion";
import { BarChart, Bar, XAxis, ResponsiveContainer, Tooltip } from "recharts";

gsap.registerPlugin(ScrollTrigger);

const barData = [
    { hour: "9am", mins: 48 }, { hour: "10am", mins: 55 }, { hour: "11am", mins: 62 },
    { hour: "12pm", mins: 22 }, { hour: "1pm", mins: 38 }, { hour: "2pm", mins: 60 },
    { hour: "3pm", mins: 55 }, { hour: "4pm", mins: 48 }, { hour: "5pm", mins: 30 },
];

const leaderboardBase = [
    { name: "CosmicWolf", score: 94, rank: 1 },
    { name: "NebulaFox", score: 91, rank: 2 },
    { name: "PixelShark", score: 88, rank: 3 },
    { name: "SolarEagle", score: 86, rank: 4 },
    { name: "You", score: 82, rank: 5, isYou: true },
    { name: "NightOwl", score: 79, rank: 6 },
];

const tooltipStyle = {
    background: "rgba(0,0,0,0.95)",
    border: "1px solid rgba(88,240,255,0.15)",
    borderRadius: "10px",
    color: "white",
    fontSize: "11px",
    padding: "6px 12px",
};

function AnimatedLeaderboard() {
    const [entries, setEntries] = useState(leaderboardBase);
    const [animating, setAnimating] = useState(false);

    useEffect(() => {
        const timer = setInterval(() => {
            if (animating) return;
            setAnimating(true);
            setEntries((prev) => {
                const next = [...prev];
                // Randomly swap two adjacent entries > rank 1
                const idx = Math.floor(Math.random() * (next.length - 1)) + 1;
                if (idx < next.length - 1) {
                    [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
                    next[idx].rank = idx + 1;
                    next[idx + 1].rank = idx + 2;
                }
                return next;
            });
            setTimeout(() => setAnimating(false), 600);
        }, 2200);

        return () => clearInterval(timer);
    }, [animating]);

    return (
        <div className="space-y-1.5">
            <AnimatePresence mode="popLayout">
                {entries.map((entry) => (
                    <motion.div
                        key={entry.name}
                        layout
                        layoutId={entry.name}
                        className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm ${entry.isYou ? "border border-neon/25 bg-neon/[0.07]" : "border border-white/[0.05] bg-white/[0.03]"
                            }`}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    >
                        <span
                            className="w-7 text-center font-display text-base font-bold"
                            style={{
                                color: entry.rank === 1 ? "#f5c842" : entry.rank === 2 ? "#a0aec0" : entry.rank === 3 ? "#b7791f" : "rgba(255,255,255,0.25)",
                            }}
                        >
                            #{entry.rank}
                        </span>
                        <span className={`flex-1 font-medium ${entry.isYou ? "text-neon" : "text-white/70"}`}>{entry.name}</span>
                        <span className="font-bold text-white">{entry.score}</span>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}

export function DataShowcase() {
    const sectionRef = useRef<HTMLDivElement>(null);
    const [triggered, setTriggered] = useState(false);

    useEffect(() => {
        const ctx = gsap.context(() => {
            ScrollTrigger.create({
                trigger: sectionRef.current,
                start: "top 70%",
                onEnter: () => setTriggered(true),
                once: true,
            });
        }, sectionRef);
        return () => ctx.revert();
    }, []);

    return (
        <section ref={sectionRef} className="relative overflow-hidden bg-black py-32">
            {/* Gradient splash */}
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute left-1/4 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-plasma/[0.12] blur-[120px]" />
            </div>

            <div className="relative z-10 mx-auto max-w-7xl px-8">
                {/* Header */}
                <div className="mb-20 text-left">
                    <p className="mb-3 text-[10px] uppercase tracking-[0.6em] text-white/25">Live Analytics</p>
                    <h2 className="font-display text-[clamp(36px,5vw,72px)] font-black leading-[0.9] tracking-tight text-white">
                        DATA THAT<br />
                        <span style={{ background: "linear-gradient(135deg,#58f0ff,#9c6bff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                            MOVES WITH YOU
                        </span>
                    </h2>
                </div>

                <div className="grid gap-8 lg:grid-cols-2">
                    {/* Bar chart */}
                    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-8">
                        <div className="mb-2 flex items-start justify-between">
                            <div>
                                <p className="font-display text-lg font-bold text-white">Active Minutes</p>
                                <p className="text-xs text-white/30">Productive time per hour today</p>
                            </div>
                            <div className="rounded-full border border-neon/20 bg-neon/[0.08] px-3 py-1 text-[10px] font-medium uppercase tracking-wider text-neon">
                                Live
                            </div>
                        </div>
                        <div className="mt-6">
                            <ResponsiveContainer width="100%" height={220}>
                                <BarChart data={triggered ? barData : barData.map((d) => ({ ...d, mins: 0 }))}>
                                    <defs>
                                        <linearGradient id="barGradDS" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#58f0ff" stopOpacity={1} />
                                            <stop offset="100%" stopColor="#6d6dff" stopOpacity={0.4} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="hour" stroke="rgba(255,255,255,0.12)" tickLine={false} axisLine={false} style={{ fontSize: "10px", fill: "rgba(255,255,255,0.4)" }} />
                                    <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(88,240,255,0.04)" }} />
                                    <Bar dataKey="mins" radius={[8, 8, 0, 0]} fill="url(#barGradDS)" animationDuration={1400} maxBarSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Leaderboard */}
                    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-8">
                        <div className="mb-6 flex items-start justify-between">
                            <div>
                                <p className="font-display text-lg font-bold text-white">Focus Leaderboard</p>
                                <p className="text-xs text-white/30">Weekly rankings · resets Sunday</p>
                            </div>
                            <div className="rounded-full border border-aurora/20 bg-aurora/[0.06] px-3 py-1 text-[10px] font-medium uppercase tracking-wider text-aurora">
                                Ranked
                            </div>
                        </div>
                        <AnimatedLeaderboard />
                    </div>
                </div>
            </div>
        </section>
    );
}
