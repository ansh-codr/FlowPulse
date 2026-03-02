import { useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Link } from "react-router-dom";

export function NavBar() {
    const [scrolled, setScrolled] = useState(false);
    const { scrollY } = useScroll();
    const opacity = useTransform(scrollY, [0, 80], [0, 1]);

    useEffect(() => {
        return scrollY.on("change", (y) => setScrolled(y > 40));
    }, [scrollY]);

    return (
        <motion.header
            className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4"
            style={{}}
        >
            {/* Background blur that fades in on scroll */}
            <motion.div
                className="absolute inset-0 border-b border-white/[0.06]"
                style={{
                    opacity,
                    background: "rgba(5,6,10,0.85)",
                    backdropFilter: "blur(24px)",
                    WebkitBackdropFilter: "blur(24px)",
                }}
            />

            {/* Logo */}
            <div className="relative flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-plasma to-aurora shadow-glow-plasma">
                    <svg className="h-4 w-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                    </svg>
                </div>
                <span className="font-display text-base font-semibold text-white">FlowPulse</span>
                <span className={`ml-1 h-1.5 w-1.5 rounded-full bg-neon transition-all ${scrolled ? "opacity-100" : "opacity-60"} animate-pulse-glow`} />
            </div>

            {/* Nav links */}
            <nav className="relative hidden items-center gap-6 text-sm text-white/50 md:flex">
                <a href="#how-it-works" className="transition hover:text-white">How it works</a>
                <a href="#features" className="transition hover:text-white">Features</a>
                <a href="#demo" className="transition hover:text-white">Live Demo</a>
            </nav>

            {/* CTA */}
            <div className="relative flex items-center gap-3">
                <Link
                    to="/login"
                    className="hidden rounded-xl border border-white/[0.10] bg-white/[0.05] px-4 py-2 text-sm font-medium text-white/70 transition hover:text-white sm:block"
                >
                    Sign in
                </Link>
                <Link
                    to="/login"
                    className="group relative overflow-hidden rounded-xl px-4 py-2 text-sm font-semibold text-white"
                    style={{
                        background: "linear-gradient(135deg, rgba(88,240,255,0.25), rgba(109,109,255,0.2))",
                        border: "1px solid rgba(88,240,255,0.3)",
                    }}
                >
                    <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/[0.1] to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                    Get Started
                </Link>
            </div>
        </motion.header>
    );
}
