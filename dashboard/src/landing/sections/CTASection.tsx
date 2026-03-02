import { motion } from "framer-motion";
import { useAuth } from "../../hooks/useAuth";
import { Link } from "react-router-dom";

export function CTASection() {
    const { signIn, loading, user } = useAuth();

    return (
        <section id="cta" className="relative overflow-hidden py-32">
            {/* Rich gradient background */}
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute inset-0"
                    style={{ background: "radial-gradient(ellipse 80% 60% at 50% 50%, rgba(109,109,255,0.2), transparent 70%)" }} />
                <div className="absolute left-0 top-0 h-full w-px"
                    style={{ background: "linear-gradient(to bottom, transparent, rgba(88,240,255,0.1), transparent)" }} />
                <div className="absolute right-0 top-0 h-full w-px"
                    style={{ background: "linear-gradient(to bottom, transparent, rgba(156,107,255,0.1), transparent)" }} />
            </div>

            <div className="relative z-10 mx-auto max-w-3xl px-8 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    {/* Badge */}
                    <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-neon/20 bg-neon/[0.06] px-4 py-1.5 text-xs font-medium text-neon">
                        <span className="h-1.5 w-1.5 animate-pulse-glow rounded-full bg-neon" />
                        Free to use · No credit card
                    </div>

                    <h2 className="mb-5 font-display text-5xl font-bold leading-tight text-white lg:text-6xl">
                        Start building your{" "}
                        <span style={{ background: "linear-gradient(135deg,#58f0ff,#9c6bff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                            focus ↗
                        </span>
                    </h2>

                    <p className="mb-10 text-lg leading-relaxed text-white/40">
                        Join 2,400+ students who use FlowPulse to understand their patterns, eliminate distractions, and ship more.
                    </p>

                    {user ? (
                        <Link
                            to="/app"
                            className="group relative inline-flex overflow-hidden rounded-2xl px-10 py-4 text-base font-semibold text-white shadow-glow-neon"
                            style={{
                                background: "linear-gradient(135deg, rgba(88,240,255,0.3), rgba(109,109,255,0.25))",
                                border: "1px solid rgba(88,240,255,0.4)",
                            }}
                        >
                            <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/[0.12] to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                            Go to Dashboard →
                        </Link>
                    ) : (
                        <div className="flex flex-col items-center gap-4">
                            <motion.button
                                onClick={signIn}
                                disabled={loading}
                                className="group relative flex items-center gap-3 overflow-hidden rounded-2xl px-10 py-4 text-base font-semibold text-white shadow-glow-neon disabled:opacity-50"
                                style={{
                                    background: "linear-gradient(135deg, rgba(88,240,255,0.25), rgba(109,109,255,0.2))",
                                    border: "1px solid rgba(88,240,255,0.4)",
                                }}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/[0.12] to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                                <svg className="h-5 w-5 flex-shrink-0" viewBox="0 0 24 24">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                </svg>
                                {loading ? "Connecting…" : "Sign in with Google — It's free"}
                            </motion.button>
                            <p className="text-xs text-white/25">No data sold. No browsing history stored. Privacy by design.</p>
                        </div>
                    )}

                    {/* Stats row */}
                    <div className="mt-16 grid grid-cols-3 gap-8 border-t border-white/[0.06] pt-10">
                        {[
                            { value: "2,400+", label: "Active students" },
                            { value: "99.2%", label: "Privacy preserved" },
                            { value: "82pts", label: "Avg focus gain" },
                        ].map((stat) => (
                            <div key={stat.label}>
                                <p className="font-display text-3xl font-bold text-white">{stat.value}</p>
                                <p className="mt-1 text-sm text-white/30">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
