import { useRef, useState, useCallback } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { useAuth } from "../../../hooks/useAuth";
import { Link } from "react-router-dom";

// Magnetic button that attracts toward cursor
function MagneticButton({ children, onClick, disabled }: {
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
}) {
    const ref = useRef<HTMLButtonElement>(null);
    const rawX = useMotionValue(0);
    const rawY = useMotionValue(0);
    const springX = useSpring(rawX, { stiffness: 200, damping: 20 });
    const springY = useSpring(rawY, { stiffness: 200, damping: 20 });

    function handleMouseMove(e: React.MouseEvent<HTMLButtonElement>) {
        const rect = ref.current?.getBoundingClientRect();
        if (!rect) return;
        const cx = e.clientX - rect.left - rect.width / 2;
        const cy = e.clientY - rect.top - rect.height / 2;
        rawX.set(cx * 0.35);
        rawY.set(cy * 0.35);
    }

    function handleMouseLeave() {
        rawX.set(0);
        rawY.set(0);
    }

    return (
        <motion.button
            ref={ref}
            style={{ x: springX, y: springY, background: "linear-gradient(135deg, #7C9FC9 0%, #527FB0 100%)" }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onClick={onClick}
            disabled={disabled}
            className="group relative overflow-hidden rounded-full px-12 py-5 text-base font-black uppercase tracking-[0.2em] text-black disabled:opacity-60"
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.97 }}
        >
            <span className="absolute inset-0 -translate-x-full bg-white/25 transition-transform duration-500 skew-x-12 group-hover:translate-x-full" />
            {children}
        </motion.button>
    );
}

export function CTAFinal() {
    const { user, signIn, loading } = useAuth();
    const sectionRef = useRef<HTMLDivElement>(null);
    const [spotPos, setSpotPos] = useState({ x: 50, y: 50 });

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        const rect = sectionRef.current?.getBoundingClientRect();
        if (!rect) return;
        const xPct = ((e.clientX - rect.left) / rect.width) * 100;
        const yPct = ((e.clientY - rect.top) / rect.height) * 100;
        setSpotPos({ x: xPct, y: yPct });
    }, []);

    return (
        <section
            ref={sectionRef}
            onMouseMove={handleMouseMove}
            className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-deep py-32"
        >
            {/* Cursor spotlight */}
            <div
                className="pointer-events-none absolute inset-0 transition-none"
                style={{
                    background: `radial-gradient(600px circle at ${spotPos.x}% ${spotPos.y}%, rgba(124,159,201,0.07), transparent 50%)`,
                }}
            />

            {/* Ambient glow orbs */}
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-plasma/[0.15] blur-[120px]" />
            </div>

            {/* Content */}
            <div className="relative z-10 text-center">
                <motion.p
                    className="mb-6 text-[10px] uppercase tracking-[0.7em] text-white/25"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    Join 2,400+ students
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                >
                    <h2
                        className="font-display font-black leading-[0.88] tracking-tight text-white"
                        style={{ fontSize: "clamp(56px, 9vw, 120px)" }}
                    >
                        START YOUR
                    </h2>
                    <h2
                        className="font-display font-thin leading-[0.88] tracking-[0.06em]"
                        style={{
                            fontSize: "clamp(56px, 9vw, 120px)",
                            background: "linear-gradient(135deg, #7C9FC9 0%, #527FB0 60%, #7C9FC9 100%)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                        }}
                    >
                        FLOW ↗
                    </h2>
                </motion.div>

                <motion.p
                    className="mx-auto mt-8 max-w-md text-base leading-relaxed text-white/30"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                >
                    Understand your patterns. Eliminate distractions. Achieve more — every single day.
                </motion.p>

                <motion.div
                    className="mt-12 flex flex-col items-center gap-5"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                >
                    {user ? (
                        <Link to="/app">
                            <MagneticButton>Go to Dashboard →</MagneticButton>
                        </Link>
                    ) : (
                        <MagneticButton onClick={signIn} disabled={loading}>
                            {loading ? "Connecting…" : "Sign in with Google"}
                        </MagneticButton>
                    )}
                    <p className="text-[10px] uppercase tracking-[0.4em] text-white/20">
                        Free for students · Privacy first
                    </p>
                </motion.div>

                {/* Stats */}
                <motion.div
                    className="mt-20 flex justify-center gap-16"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5, duration: 0.6 }}
                >
                    {[
                        { value: "2,400+", label: "Students" },
                        { value: "99.2%", label: "Privacy" },
                        { value: "82pts", label: "Avg Gain" },
                    ].map((stat) => (
                        <div key={stat.label} className="text-center">
                            <p className="font-display text-4xl font-black text-white">{stat.value}</p>
                            <p className="mt-1 text-[10px] uppercase tracking-[0.4em] text-white/25">{stat.label}</p>
                        </div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
