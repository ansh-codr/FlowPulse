import { motion } from "framer-motion";

const features = [
    {
        title: "Focus Score",
        description: "A live 0–100 score computed from your session data, streaks, and distraction patterns.",
        icon: (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
            </svg>
        ),
        color: "#58f0ff",
    },
    {
        title: "Activity Heatmap",
        description: "Visualize your productivity across days and hours with a GitHub-style contribution heatmap.",
        icon: (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="4" height="4" rx="1" /><rect x="10" y="3" width="4" height="4" rx="1" /><rect x="17" y="3" width="4" height="4" rx="1" />
                <rect x="3" y="10" width="4" height="4" rx="1" /><rect x="10" y="10" width="4" height="4" rx="1" /><rect x="17" y="10" width="4" height="4" rx="1" />
                <rect x="3" y="17" width="4" height="4" rx="1" /><rect x="10" y="17" width="4" height="4" rx="1" /><rect x="17" y="17" width="4" height="4" rx="1" />
            </svg>
        ),
        color: "#9c6bff",
    },
    {
        title: "App Analytics",
        description: "Know exactly which apps and websites are consuming your time and whether they're helping or hurting.",
        icon: (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
        ),
        color: "#f5c842",
    },
    {
        title: "Leaderboard",
        description: "Compete anonymously with peers via weekly focus rankings. No real names — just your game tag.",
        icon: (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 9H4a2 2 0 00-2 2v7a2 2 0 002 2h2" /><path d="M18 9h2a2 2 0 012 2v7a2 2 0 01-2 2h-2" />
                <rect x="8" y="4" width="8" height="16" rx="2" />
            </svg>
        ),
        color: "#4ade80",
    },
    {
        title: "Session Replay",
        description: "Drill into any session to see the exact start/end, focus level, and apps used — with full timestamps.",
        icon: (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
            </svg>
        ),
        color: "#ff8a8a",
    },
    {
        title: "Privacy First",
        description: "No browsing content is ever transmitted. Only aggregate focus metrics and time summaries leave your device.",
        icon: (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
        ),
        color: "#6d6dff",
    },
];

export function FeaturesSection() {
    return (
        <section id="features" className="relative py-32 overflow-hidden">
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-plasma/[0.08] blur-[120px]" />
            </div>

            <div className="relative z-10 mx-auto max-w-7xl px-8">
                <motion.div
                    className="mb-16 text-center"
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ duration: 0.6 }}
                >
                    <p className="mb-3 text-xs uppercase tracking-[0.5em] text-plasma/70">Capabilities</p>
                    <h2 className="font-display text-4xl font-bold text-white lg:text-5xl">Everything you need</h2>
                    <p className="mx-auto mt-4 max-w-xl text-base text-white/40">
                        A complete productivity intelligence suite built specifically for students and developers.
                    </p>
                </motion.div>

                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {features.map((feature, i) => (
                        <motion.div
                            key={feature.title}
                            className="group relative overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.03] p-6 backdrop-blur-xl"
                            initial={{ opacity: 0, y: 24 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-60px" }}
                            transition={{ delay: i * 0.08, duration: 0.5 }}
                            whileHover={{ y: -4, transition: { duration: 0.2 } }}
                        >
                            {/* Top accent */}
                            <div
                                className="absolute left-0 right-0 top-0 h-px transition-all group-hover:h-[2px]"
                                style={{ background: `linear-gradient(90deg, transparent, ${feature.color}80, transparent)` }}
                            />
                            {/* Hover glow */}
                            <div
                                className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                                style={{ background: `radial-gradient(ellipse at top left, ${feature.color}08, transparent 60%)` }}
                            />

                            <div
                                className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl"
                                style={{ background: `${feature.color}18`, color: feature.color, border: `1px solid ${feature.color}25` }}
                            >
                                {feature.icon}
                            </div>
                            <h3 className="mb-2 font-display text-base font-semibold text-white">{feature.title}</h3>
                            <p className="text-sm leading-relaxed text-white/40">{feature.description}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
