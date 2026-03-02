import { useState, useCallback } from "react";
import { Loader } from "./Loader";
import { HeroScene } from "./hero/HeroScene";
import { PinnedSection } from "./sections/PinnedSection";
import { DataShowcase } from "./sections/DataShowcase";
import { CTAFinal } from "./sections/CTAFinal";
import { NavBar } from "../NavBar";

export function ImmersiveLanding() {
    const [loaderDone, setLoaderDone] = useState(false);
    const onLoaderComplete = useCallback(() => setLoaderDone(true), []);

    return (
        <div className="relative bg-deep" style={{ overflowX: "hidden" }}>
            {/* Film grain overlay — always present */}
            <div
                className="pointer-events-none fixed inset-0 z-[90] mix-blend-overlay opacity-[0.025]"
                style={{
                    backgroundImage:
                        "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E\")",
                    backgroundRepeat: "repeat",
                }}
            />

            {/* Cinematic loader */}
            <Loader onComplete={onLoaderComplete} />

            {/* Main content — shown once loader completes */}
            {loaderDone && (
                <>
                    {/* Sticky nav */}
                    <NavBar />

                    {/* Hero full screen */}
                    <HeroScene />

                    {/* Scroll-driven feature blocks */}
                    <PinnedSection />

                    {/* Data showcase */}
                    <DataShowcase />

                    {/* Dramatic CTA */}
                    <CTAFinal />

                    {/* Footer */}
                    <footer className="border-t border-white/[0.04] bg-deep py-10">
                        <div className="mx-auto flex max-w-7xl flex-col items-center gap-5 px-8 sm:flex-row sm:justify-between">
                            <div className="flex items-center gap-2.5">
                                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-plasma to-aurora">
                                    <svg className="h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                                    </svg>
                                </div>
                                <span className="font-display text-sm font-semibold text-white">FlowPulse</span>
                            </div>
                            <p className="text-[10px] uppercase tracking-[0.4em] text-white/15 text-center">
                                © 2025 FlowPulse · Productivity Intelligence · Privacy First
                            </p>
                            <div className="flex gap-6 text-[10px] uppercase tracking-[0.3em] text-white/20">
                                <a href="#" className="hover:text-white transition">Privacy</a>
                                <a href="#" className="hover:text-white transition">Terms</a>
                            </div>
                        </div>
                    </footer>
                </>
            )}
        </div>
    );
}
