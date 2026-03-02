import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { AreaChart, Area, BarChart, Bar, XAxis, ResponsiveContainer, Tooltip } from "recharts";

const focusData = [
    { hour: "9am", score: 0 }, { hour: "10am", score: 0 }, { hour: "11am", score: 0 },
    { hour: "12pm", score: 0 }, { hour: "1pm", score: 0 }, { hour: "2pm", score: 0 },
    { hour: "3pm", score: 0 }, { hour: "4pm", score: 0 }, { hour: "5pm", score: 0 },
];
const focusDataFull = [
    { hour: "9am", score: 62 }, { hour: "10am", score: 88 }, { hour: "11am", score: 75 },
    { hour: "12pm", score: 45 }, { hour: "1pm", score: 70 }, { hour: "2pm", score: 92 },
    { hour: "3pm", score: 84 }, { hour: "4pm", score: 68 }, { hour: "5pm", score: 55 },
];
const barDataFull = [
    { hour: "9am", mins: 48 }, { hour: "10am", mins: 55 }, { hour: "11am", mins: 60 },
    { hour: "12pm", mins: 22 }, { hour: "1pm", mins: 40 }, { hour: "2pm", mins: 58 },
    { hour: "3pm", mins: 52 }, { hour: "4pm", mins: 45 }, { hour: "5pm", mins: 30 },
];

const leaderboardData = [
    { name: "CosmicWolf", score: 94, rank: 1 },
    { name: "NebulaFox", score: 91, rank: 2 },
    { name: "PixelShark", score: 87, rank: 3 },
    { name: "SolarEagle", score: 84, rank: 4 },
    { name: "You", score: 82, rank: 5, isYou: true },
];

const tooltipStyle = {
    background: "rgba(5,6,10,0.95)",
    border: "1px solid rgba(88,240,255,0.15)",
    borderRadius: "10px",
    color: "white",
    fontSize: "11px",
    padding: "6px 12px",
};

function AnimatedFocusRing({ inView }: { inView: boolean }) {
    const [score, setScore] = useState(0);
    const radius = 54;
    const circ = 2 * Math.PI * radius;

    useEffect(() => {
        if (!inView) return;
        const timeout = setTimeout(() => {
            let start = 0;
            const target = 82;
            const step = () => {
                start += 2;
                setScore(Math.min(start, target));
                if (start < target) requestAnimationFrame(step);
            };
            requestAnimationFrame(step);
        }, 300);
        return () => clearTimeout(timeout);
    }, [inView]);

    return (
        <div className="relative flex h-36 w-36 items-center justify-center">
            <svg className="h-full w-full -rotate-90" viewBox="0 0 140 140">
                <circle cx="70" cy="70" r={radius} stroke="rgba(255,255,255,0.06)" strokeWidth="8" fill="none" />
                <circle
                    cx="70" cy="70" r={radius}
                    stroke="url(#demoGrad)"
                    strokeWidth="8"
                    strokeLinecap="round"
                    fill="none"
                    style={{
                        strokeDasharray: circ,
                        strokeDashoffset: circ - (score / 100) * circ,
                        transition: "stroke-dashoffset 0.05s linear",
                    }}
                />
                <defs>
                    <linearGradient id="demoGrad" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#58f0ff" />
                        <stop offset="100%" stopColor="#9c6bff" />
                    </linearGradient>
                </defs>
            </svg>
            <div className="absolute text-center">
                <p className="font-display text-4xl font-bold" style={{ background: "linear-gradient(135deg,#58f0ff,#9c6bff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                    {score}
                </p>
                <p className="text-[9px] uppercase tracking-widest text-white/40">Focus</p>
            </div>
        </div>
    );
}

export function LiveDemoSection() {
    const ref = useRef<HTMLDivElement>(null);
    const inView = useInView(ref, { once: true, margin: "-100px" });
    const [chartData, setChartData] = useState(focusData);

    useEffect(() => {
        if (!inView) return;
        const timer = setTimeout(() => {
            setChartData(focusDataFull);
        }, 500);
        return () => clearTimeout(timer);
    }, [inView]);

    return (
        <section id="demo" className="relative py-32 overflow-hidden" ref={ref}>
            {/* Background */}
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute right-0 top-0 h-[500px] w-[500px] rounded-full bg-aurora/10 blur-[120px]" />
                <div className="absolute left-1/4 bottom-0 h-[400px] w-[400px] rounded-full bg-neon/[0.07] blur-[100px]" />
            </div>

            <div className="relative z-10 mx-auto max-w-7xl px-8">
                {/* Header */}
                <motion.div
                    className="mb-16 text-center"
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ duration: 0.6 }}
                >
                    <p className="mb-3 text-xs uppercase tracking-[0.5em] text-aurora/70">Live Preview</p>
                    <h2 className="font-display text-4xl font-bold text-white lg:text-5xl">See it in action</h2>
                    <p className="mx-auto mt-4 max-w-xl text-base text-white/40">
                        Real data visualizations that update throughout your day.
                    </p>
                </motion.div>

                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Left column */}
                    <div className="space-y-6">
                        {/* Focus Ring + Score */}
                        <motion.div
                            className="rounded-2xl border border-white/[0.07] bg-white/[0.04] p-6 backdrop-blur-xl"
                            initial={{ opacity: 0, x: -24 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                        >
                            <p className="mb-1 font-display text-sm font-semibold text-white">Focus Score</p>
                            <p className="mb-5 text-xs text-white/30">Computed in real-time from your session data</p>
                            <div className="flex items-center gap-8">
                                <AnimatedFocusRing inView={inView} />
                                <div className="space-y-4">
                                    {[
                                        { label: "Active mins", value: "4h 12m", color: "#58f0ff" },
                                        { label: "Distractions", value: "14", color: "#ff8a8a" },
                                        { label: "Streak", value: "7 days 🔥", color: "#f5c842" },
                                    ].map((stat) => (
                                        <div key={stat.label}>
                                            <p className="text-[10px] uppercase tracking-wider text-white/30">{stat.label}</p>
                                            <p className="font-display text-xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>

                        {/* Area chart */}
                        <motion.div
                            className="rounded-2xl border border-white/[0.07] bg-white/[0.04] p-6 backdrop-blur-xl"
                            initial={{ opacity: 0, x: -24 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1, duration: 0.6 }}
                        >
                            <p className="mb-1 font-display text-sm font-semibold text-white">Cognitive Altitude</p>
                            <p className="mb-4 text-xs text-white/30">Focus waves throughout the day</p>
                            <ResponsiveContainer width="100%" height={140}>
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#58f0ff" stopOpacity={0.4} />
                                            <stop offset="100%" stopColor="#9c6bff" stopOpacity={0.02} />
                                        </linearGradient>
                                        <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                                            <stop offset="0%" stopColor="#9c6bff" />
                                            <stop offset="100%" stopColor="#58f0ff" />
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="hour" stroke="rgba(255,255,255,0.15)" tickLine={false} axisLine={false} style={{ fontSize: "10px" }} />
                                    <Tooltip contentStyle={tooltipStyle} />
                                    <Area
                                        type="monotone" dataKey="score"
                                        stroke="url(#lineGrad)" fill="url(#areaGrad)"
                                        strokeWidth={2} dot={false}
                                        animationDuration={1500}
                                        activeDot={{ r: 4, fill: "#58f0ff", stroke: "rgba(88,240,255,0.4)", strokeWidth: 4 }}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </motion.div>
                    </div>

                    {/* Right column */}
                    <div className="space-y-6">
                        {/* Bar chart */}
                        <motion.div
                            className="rounded-2xl border border-white/[0.07] bg-white/[0.04] p-6 backdrop-blur-xl"
                            initial={{ opacity: 0, x: 24 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                        >
                            <p className="mb-1 font-display text-sm font-semibold text-white">Active Minutes</p>
                            <p className="mb-4 text-xs text-white/30">Productive time per hour</p>
                            <ResponsiveContainer width="100%" height={140}>
                                <BarChart data={inView ? barDataFull : focusData.map(d => ({ hour: d.hour, mins: 0 }))}>
                                    <defs>
                                        <linearGradient id="barGrad2" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#58f0ff" stopOpacity={0.9} />
                                            <stop offset="100%" stopColor="#6d6dff" stopOpacity={0.5} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="hour" stroke="rgba(255,255,255,0.15)" tickLine={false} axisLine={false} style={{ fontSize: "10px" }} />
                                    <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(88,240,255,0.06)" }} />
                                    <Bar dataKey="mins" radius={[6, 6, 0, 0]} fill="url(#barGrad2)" animationDuration={1200} />
                                </BarChart>
                            </ResponsiveContainer>
                        </motion.div>

                        {/* Leaderboard */}
                        <motion.div
                            className="rounded-2xl border border-white/[0.07] bg-white/[0.04] p-6 backdrop-blur-xl"
                            initial={{ opacity: 0, x: 24 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1, duration: 0.6 }}
                        >
                            <p className="mb-1 font-display text-sm font-semibold text-white">Weekly Leaderboard</p>
                            <p className="mb-4 text-xs text-white/30">Anonymous rankings reset every Sunday</p>
                            <div className="space-y-2">
                                {leaderboardData.map((entry, i) => (
                                    <motion.div
                                        key={entry.rank}
                                        className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm ${entry.isYou
                                                ? "border border-neon/20 bg-neon/[0.06]"
                                                : "border border-white/[0.05] bg-white/[0.03]"
                                            }`}
                                        initial={{ opacity: 0, x: 20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: 0.3 + i * 0.08 }}
                                    >
                                        <span className="font-display text-lg font-bold w-7 text-center"
                                            style={{ color: i === 0 ? "#f5c842" : i === 1 ? "#a0aec0" : i === 2 ? "#b7791f" : "rgba(255,255,255,0.3)" }}>
                                            #{entry.rank}
                                        </span>
                                        <span className={`flex-1 font-medium ${entry.isYou ? "text-neon" : "text-white"}`}>{entry.name}</span>
                                        <span className="font-bold text-neon">{entry.score}</span>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    );
}
