import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { GlassPanel, ScrollReveal } from "../AnimationWrappers";
import { ACCENT, HIGHLIGHT, DEEP, SURFACE, GPU_STYLE } from "../motionConfig";

const HOURS = [
    { h: "6am", v: 0.15 }, { h: "7am", v: 0.30 }, { h: "8am", v: 0.65 },
    { h: "9am", v: 0.82 }, { h: "10am", v: 0.91 }, { h: "11am", v: 0.78 },
    { h: "12pm", v: 0.55 }, { h: "1pm", v: 0.40 }, { h: "2pm", v: 0.70 },
    { h: "3pm", v: 0.85 }, { h: "4pm", v: 0.60 }, { h: "5pm", v: 0.35 },
    { h: "6pm", v: 0.20 }, { h: "7pm", v: 0.45 }, { h: "8pm", v: 0.72 },
    { h: "9pm", v: 0.88 }, { h: "10pm", v: 0.76 }, { h: "11pm", v: 0.50 },
    { h: "12am", v: 0.18 }, { h: "1am", v: 0.10 }, { h: "2am", v: 0.05 },
    { h: "3am", v: 0.04 }, { h: "4am", v: 0.06 }, { h: "5am", v: 0.10 },
];

function CircularHeatmap({ revealed }: { revealed: boolean }) {
    const cx = 160; const cy = 160;
    const total = HOURS.length;
    const outerR = 130; const innerR = 60;
    const gap = 0.08;

    return (
        <div className="relative flex items-center justify-center">
            <svg width="320" height="320" viewBox="0 0 320 320">
                <defs>
                    <radialGradient id="orbGlow" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor={HIGHLIGHT} stopOpacity="0.2" />
                        <stop offset="100%" stopColor={DEEP} stopOpacity="0" />
                    </radialGradient>
                </defs>

                <circle cx={cx} cy={cy} r={innerR} fill="url(#orbGlow)" />
                <circle cx={cx} cy={cy} r={innerR * 0.7} fill={SURFACE} opacity={0.8} />

                <text x={cx} y={cy - 6} textAnchor="middle" fontSize="11" fill={HIGHLIGHT} fontFamily="monospace" opacity={0.9}>FOCUS</text>
                <text x={cx} y={cy + 12} textAnchor="middle" fontSize="9" fill={ACCENT} fontFamily="monospace" opacity={0.7}>CLOCK</text>

                {HOURS.map((hour, i) => {
                    const anglePerSeg = (2 * Math.PI) / total;
                    const startAngle = i * anglePerSeg - Math.PI / 2 + gap / 2;
                    const endAngle = startAngle + anglePerSeg - gap;
                    const maxR = innerR + (outerR - innerR) * hour.v;

                    const x1o = cx + outerR * Math.cos(startAngle);
                    const y1o = cy + outerR * Math.sin(startAngle);
                    const x2o = cx + outerR * Math.cos(endAngle);
                    const y2o = cy + outerR * Math.sin(endAngle);
                    const x1i = cx + innerR * Math.cos(startAngle);
                    const y1i = cy + innerR * Math.sin(startAngle);
                    const x2i = cx + innerR * Math.cos(endAngle);
                    const y2i = cy + innerR * Math.sin(endAngle);

                    const x1m = cx + maxR * Math.cos(startAngle);
                    const y1m = cy + maxR * Math.sin(startAngle);
                    const x2m = cx + maxR * Math.cos(endAngle);
                    const y2m = cy + maxR * Math.sin(endAngle);

                    const ringPath = [
                        `M ${x1o} ${y1o}`,
                        `A ${outerR} ${outerR} 0 0 1 ${x2o} ${y2o}`,
                        `L ${x2i} ${y2i}`,
                        `A ${innerR} ${innerR} 0 0 0 ${x1i} ${y1i}`,
                        "Z"
                    ].join(" ");

                    const valuePath = [
                        `M ${x1m} ${y1m}`,
                        `A ${maxR} ${maxR} 0 0 1 ${x2m} ${y2m}`,
                        `L ${x2i} ${y2i}`,
                        `A ${innerR} ${innerR} 0 0 0 ${x1m} ${y1m}`,
                        "Z"
                    ].join(" ");

                    const fillColor = hour.v > 0.7 ? HIGHLIGHT : ACCENT;

                    return (
                        <g key={i}>
                            <path d={ringPath} fill={SURFACE} opacity={0.3} />
                            <motion.path
                                d={valuePath}
                                fill={fillColor}
                                initial={{ opacity: 0, scale: 0.6 }}
                                animate={revealed ? { opacity: 0.15 + hour.v * 0.5, scale: 1 } : { opacity: 0, scale: 0.6 }}
                                transition={{ delay: i * 0.03, duration: 0.7, ease: "easeOut" }}
                                style={{ transformOrigin: `${cx}px ${cy}px` }}
                            />
                        </g>
                    );
                })}

                {[0, 6, 12, 18].map((idx) => {
                    const angle = (idx / total) * 2 * Math.PI - Math.PI / 2;
                    const lx = cx + (outerR + 18) * Math.cos(angle);
                    const ly = cy + (outerR + 18) * Math.sin(angle);
                    return (
                        <text key={idx} x={lx} y={ly + 4} textAnchor="middle"
                            fontSize="8" fill={ACCENT} fontFamily="monospace" opacity={0.6}>
                            {HOURS[idx].h}
                        </text>
                    );
                })}
            </svg>
        </div>
    );
}

export function FocusClockSection() {
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: true, amount: 0.2 });

    return (
        <section ref={ref} className="relative z-10 mx-auto max-w-7xl px-8 py-32 grid grid-cols-1 md:grid-cols-2 items-center gap-16" style={{ ...GPU_STYLE }}>
            {/* Left: Copy */}
            <ScrollReveal direction="left" distance={40} delay={0.1}>
                <h2 className="font-display font-black text-white leading-tight mb-6" style={{ fontSize: "clamp(28px, 4vw, 42px)" }}>
                    The Anatomy of <br/>
                    <span style={{ color: HIGHLIGHT }}>Your Day.</span>
                </h2>
                <p className="text-base leading-relaxed mb-6" style={{ color: `${HIGHLIGHT}80` }}>
                    See exactly when you hit your stride. The Focus Clock visualizes your peak performance hours chronologically, helping you structure your most demanding tasks when you naturally excel.
                </p>
                <GlassPanel className="inline-block px-5 py-4 !rounded-xl" intensity="light">
                    <span className="text-sm font-semibold tracking-wide" style={{ color: ACCENT }}>Discover Your Peak Window</span>
                </GlassPanel>
            </ScrollReveal>

            {/* Right: Clock */}
            <div className="flex justify-center md:justify-end pr-[2vw]">
                <div className="relative">
                    <div className="absolute inset-0 rounded-full" style={{ boxShadow: `0 0 100px 20px rgba(255,107,53,0.08)`, filter: "blur(20px)" }} />
                    <CircularHeatmap revealed={isInView} />
                </div>
            </div>
        </section>
    );
}