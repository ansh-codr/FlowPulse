import { useRef, useEffect, useState } from "react";
import { motion, useInView } from "framer-motion";

const ACCENT = "#527FB0";
const HIGHLIGHT = "#7C9FC9";
// deep bg via tailwind
const SURFACE = "#052558";

const STATS = [
    { value: 2400, suffix: "+", label: "Students Active" },
    { value: 99.2, suffix: "%", label: "Privacy Score", decimals: 1 },
    { value: 82, suffix: "pts", label: "Avg Focus Gain" },
];

function AnimatedNumber({ target, suffix, decimals = 0, start }: {
    target: number; suffix: string; decimals?: number; start: boolean;
}) {
    const [current, setCurrent] = useState(0);

    useEffect(() => {
        if (!start) return;
        const frames = 80;
        let frame = 0;
        const step = () => {
            frame++;
            const progress = frame / frames;
            const ease = 1 - Math.pow(1 - progress, 4);
            setCurrent(target * ease);
            if (frame < frames) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    }, [start, target]);

    return (
        <span>
            {decimals > 0 ? current.toFixed(decimals) : Math.round(current).toLocaleString()}
            {suffix}
        </span>
    );
}

export function StatsStrip() {
    const ref = useRef<HTMLDivElement>(null);
    const isIn = useInView(ref, { once: true, amount: 0.5 });

    return (
        <div
            ref={ref}
            className="relative overflow-hidden py-20"
            style={{ background: SURFACE }}
        >
            {/* Scanline */}
            <div className="pointer-events-none absolute inset-0"
                style={{ background: `repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(1,16,35,0.07) 3px, rgba(1,16,35,0.07) 4px)` }} />

            {/* Accent line top */}
            <div className="absolute top-0 inset-x-0 h-px"
                style={{ background: `linear-gradient(90deg, transparent, ${ACCENT}55, transparent)` }} />
            <div className="absolute bottom-0 inset-x-0 h-px"
                style={{ background: `linear-gradient(90deg, transparent, ${ACCENT}55, transparent)` }} />

            <div className="mx-auto max-w-5xl px-8 grid grid-cols-1 gap-12 sm:grid-cols-3">
                {STATS.map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        className="text-center"
                        initial={{ opacity: 0, y: 24 }}
                        animate={isIn ? { opacity: 1, y: 0 } : {}}
                        transition={{ delay: i * 0.12, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                    >
                        <div
                            className="font-display font-black leading-none mb-2"
                            style={{
                                fontSize: "clamp(52px, 8vw, 88px)",
                                background: `linear-gradient(135deg, ${HIGHLIGHT}, ${ACCENT})`,
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                            }}
                        >
                            <AnimatedNumber
                                target={stat.value}
                                suffix={stat.suffix}
                                decimals={stat.decimals}
                                start={isIn}
                            />
                        </div>
                        <div className="text-[10px] uppercase tracking-[0.45em]" style={{ color: `${ACCENT}80` }}>
                            {stat.label}
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
