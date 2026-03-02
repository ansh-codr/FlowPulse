import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

const ACCENT = "#527FB0";
const HIGHLIGHT = "#7C9FC9";
const SURFACE = "#052558";

const WORDS = ["UNDERSTAND", "·", "CLASSIFY", "·", "FOCUS", "·", "PERFORM", "·", "REPEAT", "·"];

export function ManifestoStrip() {
    const ref = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });

    // Scroll drives the marquee offset
    const x = useTransform(scrollYProgress, [0, 1], ["0%", "-18%"]);

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

            <motion.div
                className="flex whitespace-nowrap gap-12 will-change-transform"
                style={{ x }}
            >
                {[0, 1].map((i) => (
                    <div key={i} className="flex shrink-0 items-center gap-10">
                        {WORDS.concat(WORDS).map((word, idx) =>
                            word === "·" ? (
                                <span key={idx} className="text-2xl" style={{ color: `${ACCENT}50` }}>·</span>
                            ) : (
                                <span
                                    key={idx}
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
