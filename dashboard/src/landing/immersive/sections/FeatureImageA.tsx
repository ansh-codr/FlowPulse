import { useRef } from "react";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import asteroid1 from "../../../assets/Images/alena-aenami-lights1k1.jpg";
import { GlassPanel, ScrollReveal } from "../AnimationWrappers";
import { ACCENT, HIGHLIGHT, DEEP, SURFACE, EASE_SMOOTH, GPU_STYLE } from "../motionConfig";

// ── Circular Focus Heatmap ────────────────────────────────────────────
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

export function FeatureImageA() {
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: true, amount: 0.3 });
    const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });

    // Multi-speed parallax
    const imgY = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);
    const contentY = useTransform(scrollYProgress, [0, 1], ["5%", "-5%"]);
    const heatmapScale = useTransform(scrollYProgress, [0.2, 0.6], [0.85, 1]);

    return (
        <section ref={ref} className="relative overflow-hidden" style={{ minHeight: "100vh" }}>
            {/* Parallax image (bg layer — slowest) */}
            <motion.div className="absolute inset-0 z-0" style={{ y: imgY, ...GPU_STYLE }}>
                <img
                    src={asteroid1}
                    alt=""
                    className="h-[120%] w-full object-cover object-center"
                    style={{ marginTop: "-10%" }}
                    loading="lazy"
                />
            </motion.div>

            {/* Deep overlay */}
            <div className="pointer-events-none absolute inset-0 z-[1]" style={{ background: `rgba(8,6,4,0.72)` }} />

            {/* Left edge glow */}
            <div className="pointer-events-none absolute inset-y-0 left-0 z-[2] w-64"
                style={{ background: `linear-gradient(to right, rgba(8,6,4,0.90), transparent)` }} />

            {/* Content (mid layer) */}
            <motion.div
                className="relative z-10 mx-auto grid max-w-7xl grid-cols-1 gap-16 px-8 py-32 lg:grid-cols-2 lg:items-center"
                style={{ y: contentY, ...GPU_STYLE }}
            >
                {/* Left — copy */}
                <div>
                    <ScrollReveal direction="left" distance={50} duration={0.9}>
                        {/* Large outline number */}
                        <div
                            className="font-display font-black leading-none select-none mb-4"
                            style={{
                                fontSize: "clamp(80px, 14vw, 160px)",
                                WebkitTextStroke: `1px ${ACCENT}55`,
                                color: "transparent",
                                lineHeight: 0.85,
                            }}
                        >
                            01
                        </div>

                        <h2 className="font-display font-black text-white leading-tight mb-6"
                            style={{ fontSize: "clamp(32px, 5vw, 62px)" }}>
                            Your Brain<br />
                            <span style={{
                                background: `linear-gradient(135deg, ${HIGHLIGHT}, ${ACCENT})`,
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                            }}>on Data.</span>
                        </h2>

                        <p className="text-base leading-relaxed mb-8 max-w-sm" style={{ color: `${HIGHLIGHT}80` }}>
                            Every tab, every switch, every idle moment — tracked silently in the background. Understand exactly when you're sharp and when you're coasting.
                        </p>

                        {/* Feature pills */}
                        <GlassPanel className="inline-block !rounded-xl" intensity="light" style={{ padding: 0 }}>
                            <div className="px-5 py-4 space-y-2">
                                {["Chrome Extension", "Screen-Time API", "On-Device Processing"].map((label) => (
                                    <div key={label} className="flex items-center gap-3">
                                        <span className="h-1.5 w-1.5 rounded-full flex-shrink-0"
                                            style={{
                                                background: HIGHLIGHT,
                                                boxShadow: `0 0 6px ${HIGHLIGHT}60`,
                                            }} />
                                        <span className="text-sm" style={{ color: `${HIGHLIGHT}70` }}>{label}</span>
                                    </div>
                                ))}
                            </div>
                        </GlassPanel>
                    </ScrollReveal>
                </div>

                {/* Right — Circular Heatmap with depth-based scale */}
                <motion.div
                    className="flex items-center justify-center"
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={isInView ? { opacity: 1, scale: 1 } : {}}
                    transition={{ delay: 0.2, duration: 1.0, ease: EASE_SMOOTH }}
                    style={{ scale: heatmapScale, ...GPU_STYLE }}
                >
                    <div className="relative">
                        {/* Glow ring behind SVG */}
                        <div className="absolute inset-0 rounded-full"
                            style={{ boxShadow: `0 0 80px 20px rgba(251,247,186,0.15)` }} />
                        <CircularHeatmap revealed={isInView} />

                        {/* Legend */}
                        <div className="mt-4 flex justify-center gap-6">
                            <div className="flex items-center gap-2">
                                <div className="h-2 w-6 rounded" style={{ background: HIGHLIGHT, opacity: 0.7 }} />
                                <span className="text-[10px] uppercase tracking-widest" style={{ color: `${HIGHLIGHT}60` }}>Deep Focus</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="h-2 w-6 rounded" style={{ background: ACCENT, opacity: 0.7 }} />
                                <span className="text-[10px] uppercase tracking-widest" style={{ color: `${ACCENT}80` }}>Light Work</span>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </section>
    );
}
