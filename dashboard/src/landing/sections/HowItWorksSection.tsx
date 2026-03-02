import { motion } from "framer-motion";

const steps = [
    {
        number: "01",
        title: "Track Device Activity",
        description: "Our lightweight Chrome extension silently monitors your tab activity, app usage, and time allocation — all locally processed.",
        icon: (
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
            </svg>
        ),
        color: "#7C9FC9",
    },
    {
        number: "02",
        title: "Smart Classification",
        description: "Every URL and app is classified into Focus, Shallow, or Distraction using a trained categorization engine.",
        icon: (
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" />
            </svg>
        ),
        color: "#527FB0",
    },
    {
        number: "03",
        title: "Focus Score Computation",
        description: "A real-time focus score (0–100) is computed from your session patterns, streak continuity, and distraction frequency.",
        icon: (
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
        ),
        color: "#7C9FC9",
    },
    {
        number: "04",
        title: "Actionable Insights",
        description: "Dashboards, heatmaps, and AI nudges surface patterns so you can permanently improve your concentration habits.",
        icon: (
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
        ),
        color: "#7C9FC9",
    },
];

export function HowItWorksSection() {
    return (
        <section id="how-it-works" className="relative py-32 overflow-hidden">
            {/* Background */}
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute left-0 top-1/2 h-[400px] w-[400px] -translate-y-1/2 rounded-full bg-plasma/10 blur-[100px]" />
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
                    <p className="mb-3 text-xs uppercase tracking-[0.5em] text-neon/70">Process</p>
                    <h2 className="font-display text-4xl font-bold text-white lg:text-5xl">How it works</h2>
                    <p className="mx-auto mt-4 max-w-xl text-base text-white/40">
                        Four steps from raw browser data to actionable focus intelligence.
                    </p>
                </motion.div>

                {/* Steps */}
                <div className="relative grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                    {/* Connector line (desktop) */}
                    <div className="pointer-events-none absolute top-8 left-[12.5%] right-[12.5%] hidden h-px lg:block"
                        style={{ background: "linear-gradient(90deg, transparent, rgba(124,159,201,0.2), rgba(82,127,176,0.2), rgba(245,200,66,0.2), transparent)" }} />

                    {steps.map((step, i) => (
                        <motion.div
                            key={step.number}
                            className="relative flex flex-col gap-4"
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-60px" }}
                            transition={{ delay: i * 0.12, duration: 0.55 }}
                        >
                            {/* Number + Icon bubble */}
                            <div className="flex items-center gap-3">
                                <div
                                    className="relative flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl"
                                    style={{
                                        background: `${step.color}18`,
                                        border: `1px solid ${step.color}30`,
                                    }}
                                >
                                    <div style={{ color: step.color }}>{step.icon}</div>
                                    {/* Step number badge */}
                                    <div
                                        className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-bold"
                                        style={{ background: step.color, color: "#011023" }}
                                    >
                                        {i + 1}
                                    </div>
                                </div>
                                <span className="font-display text-4xl font-bold text-white/[0.06]">{step.number}</span>
                            </div>

                            <div>
                                <h3 className="mb-2 font-display text-base font-semibold text-white" style={{ color: step.color }}>
                                    {step.title}
                                </h3>
                                <p className="text-sm leading-relaxed text-white/40">{step.description}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
