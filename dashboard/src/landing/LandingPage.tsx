import { useEffect } from "react";
import { NavBar } from "./NavBar";
import { HeroSection } from "./sections/HeroSection";
import { HowItWorksSection } from "./sections/HowItWorksSection";
import { LiveDemoSection } from "./sections/LiveDemoSection";
import { FeaturesSection } from "./sections/FeaturesSection";
import { WellbeingSection } from "./sections/WellbeingSection";
import { CTASection } from "./sections/CTASection";

export function LandingPage() {
    // Smooth scroll for anchor links
    useEffect(() => {
        const handleAnchorClick = (e: MouseEvent) => {
            const target = e.target as HTMLAnchorElement;
            if (target.tagName === "A" && target.getAttribute("href")?.startsWith("#")) {
                e.preventDefault();
                const id = target.getAttribute("href")!.slice(1);
                document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
            }
        };
        document.addEventListener("click", handleAnchorClick);
        return () => document.removeEventListener("click", handleAnchorClick);
    }, []);

    return (
        <div className="relative min-h-screen overflow-x-hidden bg-night text-white">
            {/* Global ambient gradient layers */}
            <div className="pointer-events-none fixed inset-0 z-0">
                <div
                    className="absolute inset-0"
                    style={{
                        background:
                            "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(82,127,176,0.18) 0%, transparent 60%), " +
                            "radial-gradient(ellipse 60% 40% at 80% 80%, rgba(124,159,201,0.08) 0%, transparent 55%), " +
                            "#011023",
                    }}
                />
            </div>

            {/* Content */}
            <div className="relative z-10">
                <NavBar />
                <HeroSection />
                <HowItWorksSection />
                <LiveDemoSection />
                <FeaturesSection />
                <WellbeingSection />
                <CTASection />

                {/* Footer */}
                <footer className="border-t border-white/[0.05] py-10">
                    <div className="mx-auto max-w-7xl px-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
                        <div className="flex items-center gap-2.5">
                            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-plasma to-aurora">
                                <svg className="h-3.5 w-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                                </svg>
                            </div>
                            <span className="font-display text-sm font-semibold text-white">FlowPulse</span>
                        </div>
                        <p className="text-xs text-white/25 text-center">
                            © 2025 FlowPulse · Productivity Intelligence for Students · Privacy First
                        </p>
                        <div className="flex gap-5 text-xs text-white/30">
                            <a href="#" className="hover:text-white transition">Privacy</a>
                            <a href="#" className="hover:text-white transition">Terms</a>
                            <a href="#" className="hover:text-white transition">Contact</a>
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    );
}
