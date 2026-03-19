
import { motion, useScroll, useTransform } from "framer-motion";
import { Link } from "react-router-dom";

export function NavBar() {
    const { scrollY } = useScroll();
    
    // Smooth transition for background blur/opacity
    const bgOpacity = useTransform(scrollY, [0, 100], [0, 0.85]);
    const borderOpacity = useTransform(scrollY, [0, 100], [0, 0.1]);

    return (
        <motion.header
            className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-between px-6 py-4 md:px-12"
        >
            {/* Background blur that fades in on scroll */}
            <motion.div
                className="absolute inset-0 border-b border-white"
                style={{
                    opacity: bgOpacity,
                    background: "rgba(5, 5, 5, 0.85)", // deep dark Apple-style background
                    backdropFilter: "blur(24px)",
                    WebkitBackdropFilter: "blur(24px)",
                    borderColor: `rgba(255, 255, 255, ${borderOpacity.get()})`
                }}
            />

            {/* Left: Project Name */}
            <div className="relative flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 shadow-sm border border-white/10">
                    <svg className="h-4 w-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                    </svg>
                </div>
                <span className="font-display text-lg font-semibold tracking-tight text-white/90">FlowPulse</span>
            </div>

            {/* Center: Minimal Nav Links */}
            <nav className="relative hidden items-center gap-8 text-sm font-medium text-white/60 md:flex">
                <a href="#overview" className="transition-colors hover:text-white">Overview</a>
                <a href="#technology" className="transition-colors hover:text-white">Technology</a>
                <a href="#performance" className="transition-colors hover:text-white">Performance</a>
            </nav>

            {/* Right: CTA Button */}
            <div className="relative flex items-center gap-4">
                <Link
                    to="/login"
                    className="hidden text-sm font-medium text-white/70 transition-colors hover:text-white sm:block"
                >
                    Sign In
                </Link>
                <Link
                    to="/login"
                    className="rounded-full bg-white px-5 py-2 text-sm font-medium text-black transition-transform hover:scale-105 shadow-sm"
                >
                    Get Started
                </Link>
            </div>
        </motion.header>
    );
}
