import { useEffect, useRef, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ACCENT, HIGHLIGHT, EASE_EXPO_OUT } from "./motionConfig";

interface LoaderProps {
    onComplete: () => void;
}

// ── Particle that converges to form the logo ──────────────────
interface Particle {
    id: number;
    startX: number;
    startY: number;
    targetX: number;
    targetY: number;
    size: number;
    delay: number;
}

function generateParticles(count: number): Particle[] {
    const pts: Particle[] = [];
    for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = 180 + Math.random() * 200;
        pts.push({
            id: i,
            startX: Math.cos(angle) * dist,
            startY: Math.sin(angle) * dist,
            targetX: (Math.random() - 0.5) * 50,
            targetY: (Math.random() - 0.5) * 50,
            size: Math.random() * 3 + 1.5,
            delay: Math.random() * 0.6,
        });
    }
    return pts;
}

export function Loader({ onComplete }: LoaderProps) {
    const [progress, setProgress] = useState(0);
    const [phase, setPhase] = useState<"converge" | "pulse" | "dissolve" | "done">("converge");
    const progressRef = useRef(0);
    const rafRef = useRef<number>(0);
    const particles = useMemo(() => generateParticles(48), []);

    useEffect(() => {
        const duration = 2200;
        const start = performance.now();

        function tick(now: number) {
            const elapsed = now - start;
            const t = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - t, 3);
            const value = Math.round(eased * 100);
            progressRef.current = value;
            setProgress(value);

            // Phase: converge (0–60%), pulse (60–85%), dissolve (85–100%)
            if (t < 0.55) {
                setPhase("converge");
            } else if (t < 0.8) {
                setPhase("pulse");
            }

            if (t < 1) {
                rafRef.current = requestAnimationFrame(tick);
            } else {
                setPhase("dissolve");
                setTimeout(() => {
                    setPhase("done");
                    onComplete();
                }, 650);
            }
        }
        rafRef.current = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(rafRef.current);
    }, [onComplete]);

    function handleSkip() {
        cancelAnimationFrame(rafRef.current);
        setPhase("dissolve");
        setTimeout(() => { setPhase("done"); onComplete(); }, 400);
    }

    const showParticles = phase === "converge";
    const showPulse = phase === "pulse" || phase === "dissolve";
    const showLogo = phase !== "converge";

    return (
        <AnimatePresence>
            {phase !== "done" && (
                <motion.div
                    className="fixed inset-0 z-[100] flex flex-col items-center justify-center cursor-pointer"
                    style={{ background: "#011023" }}
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0, scale: 1.08, filter: "blur(12px)" }}
                    transition={{ duration: 0.65, ease: EASE_EXPO_OUT }}
                    onClick={handleSkip}
                >
                    {/* Film grain overlay */}
                    <div className="pointer-events-none absolute inset-0 opacity-[0.04]"
                        style={{
                            backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E\")",
                            backgroundRepeat: "repeat",
                        }}
                    />

                    {/* Central container for logo + particles */}
                    <div className="relative mb-12" style={{ width: 160, height: 160 }}>

                        {/* Converging particles */}
                        {showParticles && particles.map((p) => (
                            <motion.div
                                key={p.id}
                                className="absolute rounded-full"
                                style={{
                                    width: p.size,
                                    height: p.size,
                                    left: "50%",
                                    top: "50%",
                                    background: `linear-gradient(135deg, ${HIGHLIGHT}, ${ACCENT})`,
                                    boxShadow: `0 0 ${p.size * 3}px ${HIGHLIGHT}60`,
                                }}
                                initial={{
                                    x: p.startX,
                                    y: p.startY,
                                    opacity: 0,
                                    scale: 0.3,
                                }}
                                animate={{
                                    x: p.targetX,
                                    y: p.targetY,
                                    opacity: [0, 0.8, 1],
                                    scale: [0.3, 0.6, 0],
                                }}
                                transition={{
                                    delay: p.delay,
                                    duration: 1.2,
                                    ease: [0.22, 1, 0.36, 1],
                                }}
                            />
                        ))}

                        {/* Energy pulse ripples */}
                        {showPulse && (
                            <>
                                {[0, 1, 2].map((i) => (
                                    <motion.div
                                        key={`pulse-${i}`}
                                        className="absolute rounded-full"
                                        style={{
                                            left: "50%",
                                            top: "50%",
                                            border: `1.5px solid ${HIGHLIGHT}`,
                                            transform: "translate(-50%, -50%)",
                                        }}
                                        initial={{ width: 20, height: 20, opacity: 0.8, x: "-50%", y: "-50%" }}
                                        animate={{
                                            width: [20, 180],
                                            height: [20, 180],
                                            opacity: [0.7, 0],
                                        }}
                                        transition={{
                                            delay: i * 0.25,
                                            duration: 1.0,
                                            ease: "easeOut",
                                            repeat: Infinity,
                                            repeatDelay: 0.5,
                                        }}
                                    />
                                ))}
                            </>
                        )}

                        {/* Logo SVG — forms from particles */}
                        {showLogo && (
                            <motion.div
                                className="absolute inset-0 flex items-center justify-center"
                                initial={{ opacity: 0, scale: 0.6 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.6, ease: EASE_EXPO_OUT }}
                            >
                                <svg width="72" height="72" viewBox="0 0 72 72" fill="none">
                                    <defs>
                                        <linearGradient id="ldrGrad" x1="0" y1="0" x2="72" y2="72" gradientUnits="userSpaceOnUse">
                                            <stop offset="0%" stopColor={HIGHLIGHT} />
                                            <stop offset="100%" stopColor={ACCENT} />
                                        </linearGradient>
                                    </defs>
                                    {/* Rounded square */}
                                    <motion.rect
                                        x="4" y="4" width="64" height="64" rx="16"
                                        stroke="url(#ldrGrad)" strokeWidth="2" fill="none"
                                        initial={{ pathLength: 0, opacity: 0 }}
                                        animate={{ pathLength: 1, opacity: 1 }}
                                        transition={{ duration: 0.8, ease: "easeInOut" }}
                                    />
                                    {/* Pulse waveform path */}
                                    <motion.polyline
                                        points="18,36 26,36 30,22 36,50 42,22 46,36 54,36"
                                        stroke="url(#ldrGrad)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"
                                        initial={{ pathLength: 0, opacity: 0 }}
                                        animate={{ pathLength: 1, opacity: 1 }}
                                        transition={{ delay: 0.3, duration: 0.6, ease: "easeOut" }}
                                    />
                                    {/* Glow behind waveform */}
                                    <motion.polyline
                                        points="18,36 26,36 30,22 36,50 42,22 46,36 54,36"
                                        stroke={HIGHLIGHT} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none"
                                        style={{ filter: "blur(6px)" }}
                                        initial={{ pathLength: 0, opacity: 0 }}
                                        animate={{ pathLength: 1, opacity: 0.3 }}
                                        transition={{ delay: 0.3, duration: 0.6, ease: "easeOut" }}
                                    />
                                </svg>
                            </motion.div>
                        )}

                        {/* Dissolve particles */}
                        {phase === "dissolve" && Array.from({ length: 32 }).map((_, i) => (
                            <motion.div
                                key={`dissolve-${i}`}
                                className="absolute rounded-full"
                                style={{
                                    width: Math.random() * 4 + 2,
                                    height: Math.random() * 4 + 2,
                                    left: "50%",
                                    top: "50%",
                                    background: i % 3 === 0 ? HIGHLIGHT : ACCENT,
                                    boxShadow: `0 0 8px ${HIGHLIGHT}60`,
                                }}
                                initial={{ opacity: 1, scale: 0, x: 0, y: 0 }}
                                animate={{
                                    opacity: 0,
                                    scale: 1.5,
                                    x: (Math.random() - 0.5) * 300,
                                    y: (Math.random() - 0.5) * 300,
                                }}
                                transition={{ duration: 0.7, ease: "easeOut" }}
                            />
                        ))}
                    </div>

                    {/* Brand name */}
                    <motion.p
                        className="mb-16 font-display text-sm uppercase tracking-[0.6em] text-white/50"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 0.5 }}
                    >
                        FlowPulse
                    </motion.p>

                    {/* Progress bar + counter */}
                    <div className="w-64 space-y-3">
                        <div className="h-px overflow-hidden bg-white/10 rounded-full">
                            <motion.div
                                className="h-full rounded-full"
                                style={{
                                    width: `${progress}%`,
                                    background: `linear-gradient(90deg, ${ACCENT}, ${HIGHLIGHT})`,
                                    boxShadow: `0 0 12px ${HIGHLIGHT}40`,
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
                        transition={{ delay: 1.2 }}
                    >
                        Click to skip
                    </motion.p>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
