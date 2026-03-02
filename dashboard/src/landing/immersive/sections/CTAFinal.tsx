import { useCallback, useRef } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { useAuth } from "../../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import asteroid2 from "../../../assets/dxsbond-asteroid2-2.jpg";

const ACCENT = "#527FB0";
const HIGHLIGHT = "#7C9FC9";
const DEEP = "#011023";

export function CTAFinal() {
    const { user, signIn } = useAuth();
    const navigate = useNavigate();

    // Magnetic button
    const btnRef = useRef<HTMLButtonElement | HTMLAnchorElement | null>(null);
    const rawX = useMotionValue(0);
    const rawY = useMotionValue(0);
    const springX = useSpring(rawX, { stiffness: 220, damping: 22 });
    const springY = useSpring(rawY, { stiffness: 220, damping: 22 });

    // Cursor spotlight
    const spotX = useMotionValue("50%");
    const spotY = useMotionValue("50%");

    const onMouseMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        spotX.set(`${((e.clientX - rect.left) / rect.width) * 100}%`);
        spotY.set(`${((e.clientY - rect.top) / rect.height) * 100}%`);

        if (!btnRef.current) return;
        const br = btnRef.current.getBoundingClientRect();
        const dx = e.clientX - (br.left + br.width / 2);
        const dy = e.clientY - (br.top + br.height / 2);
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 100) { rawX.set(dx * 0.4); rawY.set(dy * 0.4); }
        else { rawX.set(0); rawY.set(0); }
    }, [rawX, rawY, spotX, spotY]);

    const onMouseLeave = useCallback(() => { rawX.set(0); rawY.set(0); }, [rawX, rawY]);

    const handleCTA = useCallback(async () => {
        if (user) navigate("/app/home");
        else await signIn();
    }, [user, signIn, navigate]);

    return (
        <section
            className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 py-32"
            style={{ background: DEEP }}
            onMouseMove={onMouseMove}
            onMouseLeave={onMouseLeave}
        >
            {/* Blurred asteroid bg */}
            <div className="pointer-events-none absolute inset-0 z-0">
                <img src={asteroid2} alt=""
                    className="h-full w-full object-cover"
                    style={{ filter: "brightness(0.22) saturate(0.7) blur(2px)", transform: "scale(1.05)" }} />
            </div>
            <div className="pointer-events-none absolute inset-0 z-[1]"
                style={{ background: `rgba(1,16,35,0.72)` }} />
            <div className="pointer-events-none absolute inset-0 z-[1]"
                style={{ background: "radial-gradient(ellipse at 50% 50%, transparent 30%, rgba(1,16,35,0.85) 100%)" }} />

            {/* Cursor spotlight */}
            <motion.div
                className="pointer-events-none absolute inset-0 z-[2]"
                style={{
                    background: `radial-gradient(circle 240px at ${spotX.get()} ${spotY.get()}, rgba(82,127,176,0.09), transparent 70%)`,
                }}
            />

            {/* Content */}
            <div className="relative z-10 text-center max-w-4xl mx-auto">
                <motion.p
                    className="text-[9px] uppercase tracking-[0.6em] mb-8"
                    style={{ color: `${ACCENT}80` }}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    Begin Your Journey
                </motion.p>

                <motion.h2
                    className="font-display font-black leading-[0.88] text-white mb-4"
                    style={{ fontSize: "clamp(56px, 12vw, 148px)" }}
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1, duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
                >
                    START YOUR
                </motion.h2>
                <motion.h2
                    className="font-display font-extralight leading-[0.88] mb-12"
                    style={{
                        fontSize: "clamp(56px, 12vw, 148px)",
                        background: `linear-gradient(135deg, ${HIGHLIGHT} 0%, ${ACCENT} 60%, ${HIGHLIGHT} 100%)`,
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundSize: "200% auto",
                        animation: "shimmer 4s linear infinite",
                    }}
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2, duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
                >
                    FLOW.
                </motion.h2>

                {/* Magnetic CTA */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.45, duration: 0.6 }}
                >
                    <motion.button
                        ref={(el) => { btnRef.current = el; }}
                        onClick={handleCTA}
                        className="group relative overflow-hidden rounded-full px-12 py-5 text-sm font-bold uppercase tracking-[0.18em] text-white"
                        style={{
                            x: springX,
                            y: springY,
                            background: `linear-gradient(135deg, ${ACCENT}, ${HIGHLIGHT})`,
                            boxShadow: `0 0 60px rgba(82,127,176,0.35)`,
                        }}
                        whileHover={{ scale: 1.06 }}
                        whileTap={{ scale: 0.97 }}
                    >
                        <span className="absolute inset-0 -translate-x-full bg-white/15 skew-x-12 transition-transform duration-500 group-hover:translate-x-full" />
                        {user ? "Go to Dashboard →" : "Sign in with Google"}
                    </motion.button>
                </motion.div>

                {/* Social proof */}
                <motion.p
                    className="mt-8 text-[10px] uppercase tracking-[0.35em]"
                    style={{ color: `${ACCENT}50` }}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.7, duration: 0.6 }}
                >
                    Free · No credit card · Privacy first · 2,400+ students
                </motion.p>
            </div>
        </section>
    );
}
