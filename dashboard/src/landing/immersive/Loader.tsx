import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface LoaderProps {
    onComplete: () => void;
}

export function Loader({ onComplete }: LoaderProps) {
    const [progress, setProgress] = useState(0);
    const [phase, setPhase] = useState<"counting" | "dissolve" | "done">("counting");
    const progressRef = useRef(0);
    const rafRef = useRef<number>(0);

    useEffect(() => {
        // Ease curve for progress: fast at first, slow at end
        const duration = 1800;
        const start = performance.now();

        function tick(now: number) {
            const elapsed = now - start;
            const t = Math.min(elapsed / duration, 1);
            // Ease out cubic
            const eased = 1 - Math.pow(1 - t, 3);
            const value = Math.round(eased * 100);
            progressRef.current = value;
            setProgress(value);

            if (t < 1) {
                rafRef.current = requestAnimationFrame(tick);
            } else {
                // Start dissolve
                setTimeout(() => setPhase("dissolve"), 100);
                setTimeout(() => {
                    setPhase("done");
                    onComplete();
                }, 600);
            }
        }
        rafRef.current = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(rafRef.current);
    }, [onComplete]);

    // Allow skip
    function handleSkip() {
        cancelAnimationFrame(rafRef.current);
        setPhase("dissolve");
        setTimeout(() => { setPhase("done"); onComplete(); }, 400);
    }

    return (
        <AnimatePresence>
            {phase !== "done" && (
                <motion.div
                    className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-deep"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0, scale: 1.04 }}
                    transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                    onClick={handleSkip}
                >
                    {/* Film grain overlay */}
                    <div className="pointer-events-none absolute inset-0 opacity-[0.04]"
                        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E\")", backgroundRepeat: "repeat" }} />

                    {/* Logo SVG — stroke draw animation */}
                    <motion.div
                        className="relative mb-12"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.4 }}
                    >
                        <svg width="72" height="72" viewBox="0 0 72 72" fill="none">
                            <defs>
                                <linearGradient id="ldrGrad" x1="0" y1="0" x2="72" y2="72" gradientUnits="userSpaceOnUse">
                                    <stop offset="0%" stopColor="#7C9FC9" />
                                    <stop offset="100%" stopColor="#527FB0" />
                                </linearGradient>
                            </defs>
                            {/* Rounded square */}
                            <motion.rect
                                x="4" y="4" width="64" height="64" rx="16"
                                stroke="url(#ldrGrad)" strokeWidth="2" fill="none"
                                initial={{ pathLength: 0, opacity: 0 }}
                                animate={{ pathLength: 1, opacity: 1 }}
                                transition={{ duration: 1, ease: "easeInOut" }}
                            />
                            {/* Pulse waveform path */}
                            <motion.polyline
                                points="18,36 26,36 30,22 36,50 42,22 46,36 54,36"
                                stroke="url(#ldrGrad)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"
                                initial={{ pathLength: 0, opacity: 0 }}
                                animate={{ pathLength: 1, opacity: 1 }}
                                transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
                            />
                        </svg>

                        {/* Dissolve particles */}
                        {phase === "dissolve" && Array.from({ length: 24 }).map((_, i) => (
                            <motion.div
                                key={i}
                                className="absolute rounded-full bg-neon"
                                style={{
                                    width: Math.random() * 4 + 2,
                                    height: Math.random() * 4 + 2,
                                    left: 36,
                                    top: 36,
                                }}
                                initial={{ opacity: 1, scale: 0, x: 0, y: 0 }}
                                animate={{
                                    opacity: 0,
                                    scale: 1,
                                    x: (Math.random() - 0.5) * 200,
                                    y: (Math.random() - 0.5) * 200,
                                }}
                                transition={{ duration: 0.6, ease: "easeOut" }}
                            />
                        ))}
                    </motion.div>

                    {/* Brand name */}
                    <motion.p
                        className="mb-16 font-display text-sm uppercase tracking-[0.6em] text-white/50"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                    >
                        FlowPulse
                    </motion.p>

                    {/* Progress bar + counter */}
                    <div className="w-64 space-y-3">
                        <div className="h-px overflow-hidden bg-white/10">
                            <motion.div
                                className="h-full"
                                style={{
                                    width: `${progress}%`,
                                    background: "linear-gradient(90deg, #527FB0, #7C9FC9)",
                                }}
                            />
                        </div>
                        <div className="flex justify-between">
                            <span className="font-display text-[11px] uppercase tracking-[0.4em] text-white/20">
                                Initializing
                            </span>
                            <motion.span
                                className="font-display text-[11px] font-bold tabular-nums text-white/50"
                                key={progress}
                            >
                                {progress}%
                            </motion.span>
                        </div>
                    </div>

                    {/* Skip hint */}
                    <motion.p
                        className="absolute bottom-8 text-[10px] uppercase tracking-[0.4em] text-white/15"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1 }}
                    >
                        Click to skip
                    </motion.p>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
