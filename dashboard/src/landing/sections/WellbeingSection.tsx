import { motion } from "framer-motion";

const wellbeingStats = [
    { sleep: "5h", focus: 42, label: "Sleep-deprived" },
    { sleep: "6h", focus: 58, label: "Under-rested" },
    { sleep: "7h", focus: 74, label: "Healthy" },
    { sleep: "8h", focus: 88, label: "Optimal" },
    { sleep: "9h", focus: 82, label: "Peak zone" },
];

const insights = [
    {
        icon: "🧠",
        title: "Cognitive Load Monitoring",
        description: "FlowPulse tracks how quickly you context-switch and estimates your cognitive load across the day.",
        color: "#7C9FC9",
    },
    {
        icon: "💤",
        title: "Sleep-Focus Correlation",
        description: "Students who sleep 7–9 hours score 48% higher on average. We surface this connection over time.",
        color: "#527FB0",
    },
    {
        icon: "⚡",
        title: "Energy-Aware Scheduling",
        description: "Learn which hours you perform best and schedule your hardest work in your peak focus windows.",
        color: "#7C9FC9",
    },
];

export function WellbeingSection() {
    const maxFocus = Math.max(...wellbeingStats.map((s) => s.focus));

    return (
        <section id="wellbeing" className="relative overflow-hidden py-32">
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute right-0 top-1/2 h-[500px] w-[500px] -translate-y-1/2 rounded-full bg-aurora/10 blur-[120px]" />
            </div>

            <div className="relative z-10 mx-auto max-w-7xl px-8">
                <motion.div
                    className="mb-16 text-center"
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ duration: 0.6 }}
                >
                    <p className="mb-3 text-xs uppercase tracking-[0.5em] text-aurora/70">Wellbeing</p>
                    <h2 className="font-display text-4xl font-bold text-white lg:text-5xl">Mind & performance</h2>
                    <p className="mx-auto mt-4 max-w-xl text-base text-white/40">
                        Productivity is inseparable from wellbeing. FlowPulse helps you understand the connection.
                    </p>
                </motion.div>

                <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
                    {/* Sleep-focus visualization */}
                    <motion.div
                        className="rounded-2xl border border-white/[0.07] bg-white/[0.04] p-8 backdrop-blur-xl"
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7 }}
                    >
                        <p className="mb-1 font-display text-base font-semibold text-white">Sleep vs Focus Score</p>
                        <p className="mb-8 text-xs text-white/30">Average correlation across 2,400+ students</p>

                        <div className="space-y-4">
                            {wellbeingStats.map((stat, i) => (
                                <div key={stat.sleep} className="flex items-center gap-4">
                                    <span className="w-8 text-right text-xs text-white/40">{stat.sleep}</span>
                                    <div className="flex-1 h-7 overflow-hidden rounded-lg bg-white/[0.04]">
                                        <motion.div
                                            className="flex h-full items-center justify-end pr-3 rounded-lg"
                                            style={{
                                                background: `linear-gradient(90deg, rgba(82,127,176,0.6), rgba(124,159,201,${0.5 + (stat.focus / 100) * 0.5}))`,
                                            }}
                                            initial={{ width: 0 }}
                                            whileInView={{ width: `${(stat.focus / maxFocus) * 100}%` }}
                                            viewport={{ once: true }}
                                            transition={{ delay: 0.3 + i * 0.1, duration: 0.8, ease: "easeOut" }}
                                        >
                                            <span className="text-xs font-bold text-white">{stat.focus}</span>
                                        </motion.div>
                                    </div>
                                    <span className="w-24 text-xs text-white/30">{stat.label}</span>
                                </div>
                            ))}
                        </div>

                        <p className="mt-6 text-xs text-white/20">
                            * Based on anonymized aggregate data. Individual results vary.
                        </p>
                    </motion.div>

                    {/* Insights list */}
                    <div className="space-y-5">
                        {insights.map((insight, i) => (
                            <motion.div
                                key={insight.title}
                                className="flex gap-5 rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5"
                                initial={{ opacity: 0, x: 30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1, duration: 0.55 }}
                                whileHover={{ x: 4, transition: { duration: 0.2 } }}
                            >
                                <div
                                    className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl text-2xl"
                                    style={{ background: `${insight.color}15`, border: `1px solid ${insight.color}20` }}
                                >
                                    {insight.icon}
                                </div>
                                <div>
                                    <h3 className="mb-1 font-display text-sm font-semibold text-white">{insight.title}</h3>
                                    <p className="text-sm leading-relaxed text-white/40">{insight.description}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
