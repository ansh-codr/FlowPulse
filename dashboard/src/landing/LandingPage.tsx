import { useEffect } from "react";
import { NavBar } from "./NavBar";
import { HeroScrollytelling } from "./sections/HeroScrollytelling";
import { BottomScrollytelling } from "./sections/BottomScrollytelling";

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
        <div className="relative min-h-screen overflow-x-hidden bg-[#050505] text-white selection:bg-white/20 selection:text-white">
            {/* Global ambient glow, very subtle */}
            <div className="pointer-events-none fixed inset-0 z-0">
                <div
                    className="absolute inset-0"
                    style={{
                        background:
                            "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(255,255,255,0.03) 0%, transparent 60%), " +
                            "#050505",
                    }}
                />
            </div>

            {/* Content */}
            <div className="relative z-10 font-sans">
                <NavBar />
                
                <main>
                    {/* The first sequence (redorb) */}
                    <HeroScrollytelling />
                    
                    {/* The second sequence (hero frames) */}
                    <BottomScrollytelling />
                </main>

                {/* Footer */}
                <footer className="border-t border-white/[0.08] bg-[#050505] py-12 relative z-20">
                    <div className="mx-auto max-w-7xl px-6 md:px-12 flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 border border-white/10 text-white">
                                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                                </svg>
                            </div>
                            <span className="text-base font-semibold tracking-tight text-white/90">FlowPulse</span>
                        </div>
                        <p className="text-sm text-white/40 tracking-wide text-center">
                            © 2025 FlowPulse · Engineered for Focus
                        </p>
                        <div className="flex gap-6 text-sm text-white/50 tracking-wide">
                            <a href="#" className="hover:text-white transition-colors">Privacy</a>
                            <a href="#" className="hover:text-white transition-colors">Terms</a>
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    );
}
