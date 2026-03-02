import { useState, useCallback } from "react";
import { Loader } from "./Loader";
import { HeroScene } from "./hero/HeroScene";
import { ManifestoStrip } from "./sections/ManifestoStrip";
import { FeatureImageA } from "./sections/FeatureImageA";
import { FeatureCards } from "./sections/FeatureCards";
import { FeatureImageB } from "./sections/FeatureImageB";
import { DataShowcase } from "./sections/DataShowcase";
import { StatsStrip } from "./sections/StatsStrip";
import { CTAFinal } from "./sections/CTAFinal";
import { NavBar } from "../NavBar";

const ACCENT = "#527FB0";
const HIGHLIGHT = "#7C9FC9";
const DEEP = "#011023";

export function ImmersiveLanding() {
    const [loaderDone, setLoaderDone] = useState(false);
    const onLoaderComplete = useCallback(() => setLoaderDone(true), []);

    return (
        <div className="relative" style={{ background: DEEP, overflowX: "hidden" }}>
            {/* Film grain overlay — always present */}
            <div
                className="pointer-events-none fixed inset-0 z-[90] mix-blend-overlay opacity-[0.018]"
                style={{
                    backgroundImage:
                        `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
                    backgroundRepeat: "repeat",
                }}
            />

            {/* Cinematic loader */}
            <Loader onComplete={onLoaderComplete} />

            {/* Main content */}
            {loaderDone && (
                <>
                    {/* Sticky nav */}
                    <NavBar />

                    {/* 1. Hero — redorb.mp4 */}
                    <HeroScene />

                    {/* 2. Manifesto marquee strip */}
                    <ManifestoStrip />

                    {/* 3. Feature A — asteroid-1 + circular heatmap */}
                    <FeatureImageA />

                    {/* 4. How It Works — 3-card sticky */}
                    <FeatureCards />

                    {/* 5. Feature B — asteroid-2 + radial leaderboard */}
                    <FeatureImageB />

                    {/* 6. Data showcase — wave chart + leaderboard */}
                    <DataShowcase />

                    {/* 7. Stats proof strip */}
                    <StatsStrip />

                    {/* 8. Dramatic CTA */}
                    <CTAFinal />

                    {/* Footer */}
                    <footer className="border-t py-10" style={{ background: DEEP, borderColor: `${ACCENT}18` }}>
                        <div className="mx-auto flex max-w-7xl flex-col items-center gap-5 px-8 sm:flex-row sm:justify-between">
                            <div className="flex items-center gap-2.5">
                                <div className="flex h-7 w-7 items-center justify-center rounded-lg"
                                    style={{ background: `linear-gradient(135deg, ${ACCENT}, ${HIGHLIGHT})` }}>
                                    <svg className="h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24"
                                        stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                                    </svg>
                                </div>
                                <span className="font-display text-sm font-semibold text-white">FlowPulse</span>
                            </div>
                            <p className="text-[10px] uppercase tracking-[0.4em] text-center" style={{ color: `${ACCENT}45` }}>
                                © 2025 FlowPulse · Productivity Intelligence · Privacy First
                            </p>
                            <div className="flex gap-6 text-[10px] uppercase tracking-[0.3em]" style={{ color: `${ACCENT}50` }}>
                                <a href="#" className="transition hover:text-white">Privacy</a>
                                <a href="#" className="transition hover:text-white">Terms</a>
                            </div>
                        </div>
                    </footer>
                </>
            )}
        </div>
    );
}
