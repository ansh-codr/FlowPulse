/**
 * FlowPulse — Unified Motion Configuration
 * ─────────────────────────────────────────
 * Color palette derived from redorb.mp4 + alena-aenami-lights1k1.jpg:
 * deep cosmic blacks + ember orange/gold + electric cyan accents
 */

import React from "react";

// ─── Brand palette ─────────────────────────────────────────────
// Drawn from redorb video: deep black core, incandescent ember glow
export const ACCENT = "#FF6B35";   // Ember orange (redorb core glow)
export const HIGHLIGHT = "#FFD166";   // Warm gold (corona of the orb)
export const DEEP = "#0A0806";   // Near-black with warm undertones
export const SURFACE = "rgba(255, 107, 53, 0.06)"; // Subtle ember surface

// ─── Easing Curves ─────────────────────────────────────────────
export const EASE_SMOOTH: [number, number, number, number] = [0.16, 1, 0.3, 1];
export const EASE_EXPO_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];
export const EASE_POWER3_OUT = "power3.out";
export const EASE_SUBTLE: [number, number, number, number] = [0.4, 0, 0.2, 1];

// ─── Timing ────────────────────────────────────────────────────
export const TIMING = {
    sectionReveal: 0.9,
    cardStagger: 0.12,
    elementFade: 0.7,
    loaderDuration: 2200,
    heroEntrance: 1.0,
    scrollScrub: 0.8,
} as const;

// ─── Parallax ──────────────────────────────────────────────────
export const PARALLAX = {
    bg: { speed: 0.15, mouseMultiplier: 0.3 },
    midBack: { speed: 0.35, mouseMultiplier: 0.6 },
    midFront: { speed: 0.6, mouseMultiplier: 0.85 },
    fg: { speed: 0.85, mouseMultiplier: 1.0 },
    mouseIntensity: { x: 18, y: 14 },
} as const;

// ─── Hover ─────────────────────────────────────────────────────
export const HOVER = {
    softScale: 1.03,
    cardLift: -8,
    glowBoost: 15,
    tiltMaxDeg: 6,
    shadowSpread: "0 14px 40px rgba(255,107,53,0.18)",
} as const;

// ─── Glass ─────────────────────────────────────────────────────
export const GLASS = {
    blur: 16,
    opacity: 0.08,
    background: `rgba(20, 12, 6, 0.6)`,
    border: `1px solid rgba(255, 107, 53, 0.15)`,
} as const;

// ─── Animation variants ────────────────────────────────────────
export const FADE_UP = { hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0 } };
export const FADE_IN = { hidden: { opacity: 0 }, visible: { opacity: 1 } };
export const SCALE_IN = { hidden: { opacity: 0, scale: 0.88 }, visible: { opacity: 1, scale: 1 } };
export const SLIDE_LEFT = { hidden: { opacity: 0, x: -50 }, visible: { opacity: 1, x: 0 } };
export const SLIDE_RIGHT = { hidden: { opacity: 0, x: 50 }, visible: { opacity: 1, x: 0 } };

// ─── Mobile Detection ──────────────────────────────────────────
export function isMobile(): boolean {
    if (typeof window === "undefined") return false;
    return window.innerWidth < 768 || /Mobi|Android/i.test(navigator.userAgent);
}

export function prefersReducedMotion(): boolean {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

// ─── GPU helper ────────────────────────────────────────────────
export const GPU_STYLE: React.CSSProperties = {
    willChange: "transform, opacity",
    backfaceVisibility: "hidden",
    WebkitBackfaceVisibility: "hidden",
    transform: "translateZ(0)",
};
