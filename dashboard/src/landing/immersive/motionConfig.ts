/**
 * FlowPulse — Unified Motion Configuration
 * ─────────────────────────────────────────
 * Centralised easing curves, timing, parallax config
 * and reusable animation presets for the immersive landing.
 */

// ─── Brand palette ────────────────────────────────────────────
export const ACCENT = "#FBF7BA";     // Cream
export const HIGHLIGHT = "#FFFFFF";  // Pure white
export const DEEP = "#9D1F15";       // Crimson red
export const SURFACE = "#7a1710";    // Slightly darker crimson

// ─── Easing Curves (typed as Framer Motion BezierDefinition) ──
export const EASE_SMOOTH: [number, number, number, number] = [0.16, 1, 0.3, 1];
export const EASE_EXPO_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];
export const EASE_POWER3_OUT = "power3.out";                   // GSAP equivalent
export const EASE_SUBTLE: [number, number, number, number] = [0.4, 0, 0.2, 1];

// ─── Timing (ms) ──────────────────────────────────────────────
export const TIMING = {
    sectionReveal: 0.9,
    cardStagger: 0.12,
    elementFade: 0.7,
    loaderDuration: 2200,
    heroEntrance: 1.0,
    scrollScrub: 0.8,
} as const;

// ─── Parallax Strategy ────────────────────────────────────────
export const PARALLAX = {
    /** 4 depth levels — bg slowest → fg subtlest */
    bg: { speed: 0.15, mouseMultiplier: 0.3 },
    midBack: { speed: 0.35, mouseMultiplier: 0.6 },
    midFront: { speed: 0.6, mouseMultiplier: 0.85 },
    fg: { speed: 0.85, mouseMultiplier: 1.0 },
    /** Mouse parallax intensity (low-to-medium) */
    mouseIntensity: { x: 18, y: 14 },
} as const;

// ─── Hover Micro-Interactions ─────────────────────────────────
export const HOVER = {
    softScale: 1.03,
    cardLift: -8,
    glowBoost: 15,              // +15% glow intensity
    tiltMaxDeg: 6,              // 3D tilt max degrees
    shadowSpread: "0 14px 40px rgba(82,127,176,0.18)",
} as const;

// ─── Glass / Blur ─────────────────────────────────────────────
export const GLASS = {
    blur: 8,
    opacity: 0.85,
    background: `rgba(122,23,16,0.${Math.round(0.85 * 100)})`,   // evaluated
    border: `1px solid ${ACCENT}30`,
} as const;

// ─── Animation presets (Framer Motion variants) ───────────────
export const FADE_UP = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0 },
};

export const FADE_IN = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
};

export const SCALE_IN = {
    hidden: { opacity: 0, scale: 0.88 },
    visible: { opacity: 1, scale: 1 },
};

export const SLIDE_LEFT = {
    hidden: { opacity: 0, x: -50 },
    visible: { opacity: 1, x: 0 },
};

export const SLIDE_RIGHT = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0 },
};

// ─── Mobile Detection ─────────────────────────────────────────
export function isMobile(): boolean {
    if (typeof window === "undefined") return false;
    return window.innerWidth < 768 || /Mobi|Android/i.test(navigator.userAgent);
}

export function prefersReducedMotion(): boolean {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

// ─── GPU‑accelerated transform helper ─────────────────────────
export const GPU_STYLE: React.CSSProperties = {
    willChange: "transform, opacity",
    backfaceVisibility: "hidden",
    WebkitBackfaceVisibility: "hidden",
    transform: "translateZ(0)",
};

import React from "react";
