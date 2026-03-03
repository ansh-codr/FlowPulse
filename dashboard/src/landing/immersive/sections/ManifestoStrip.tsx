import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ACCENT, HIGHLIGHT, SURFACE, GPU_STYLE } from "../motionConfig";

const WORDS = ["UNDERSTAND", "·", "CLASSIFY", "·", "FOCUS", "·", "PERFORM", "·", "REPEAT", "·"];

export function ManifestoStrip() {
    const ref = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });

    // Scroll drives the marquee offset — increased range for smoother motion
    const x = useTransform(scrollYProgress, [0, 1], ["0%", "-25%"]);
    const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.3, 1, 1, 0.3]);

    return (
        <div
            id="manifesto"
            ref={ref}
            className="relative overflow-hidden py-8 border-y"
            style={{
                background: SURFACE,
                borderColor: `${ACCENT}30`,
            }}
        >
            {/* Subtle scanline shimmer */}
            <div
                className="pointer-events-none absolute inset-0"
                style={{
                    background: `repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(1,16,35,0.08) 3px, rgba(1,16,35,0.08) 4px)`,
                }}
            />

            {/* Gradient edges for infinite feel */}
            <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24"
                style={{ background: `linear-gradient(to right, ${SURFACE}, transparent)` }} />
            <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24"
                style={{ background: `linear-gradient(to left, ${SURFACE}, transparent)` }} />

            <motion.div
                className="flex whitespace-nowrap gap-12"
                style={{ x, opacity, ...GPU_STYLE }}
            >
                {[0, 1, 2].map((i) => (
                    <div key={i} className="flex shrink-0 items-center gap-10">
                        {WORDS.concat(WORDS).map((word, idx) =>
                            word === "·" ? (
                                <span key={`${i}-${idx}`} className="text-2xl" style={{ color: `${ACCENT}50` }}>·</span>
                            ) : (
                                <span
                                    key={`${i}-${idx}`}
                                    className="font-display text-[13px] font-black uppercase tracking-[0.5em]"
                                    style={{ color: HIGHLIGHT }}
                                >
                                    {word}
                                </span>
                            )
                        )}
                    </div>
                ))}
            </motion.div>
        </div>
    );
}
