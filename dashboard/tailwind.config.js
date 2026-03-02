/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx,js,jsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["Space Grotesk", "sans-serif"],
        body: ["Inter", "system-ui", "sans-serif"],
      },
      colors: {
        // ── FlowPulse Brand Palette (strict 4 colors) ──────────────
        deep: "#011023",   // deepest background
        surface: "#052558",   // cards / panels / secondary bg
        accent: "#527FB0",   // primary accent (CTAs, dividers)
        highlight: "#7C9FC9",   // light accent (gradient top, text tints)
        // ── Semantic aliases for backward compat in dashboard ───────
        night: "#011023",
        plasma: "#527FB0",
        aurora: "#7C9FC9",
        neon: "#7C9FC9",
        ember: "#527FB0",
        gold: "#7C9FC9",
        success: "#7C9FC9",
        "neon-dim": "rgba(124,159,201,0.15)",
        "plasma-dim": "rgba(82,127,176,0.15)",
      },
      boxShadow: {
        glow: "0 0 40px rgba(82,127,176,0.2), 0 20px 60px rgba(82,127,176,0.1)",
        "glow-sm": "0 0 20px rgba(82,127,176,0.15)",
        "glow-lg": "0 0 80px rgba(82,127,176,0.25), 0 30px 80px rgba(82,127,176,0.15)",
        "glow-neon": "0 0 30px rgba(124,159,201,0.35), 0 0 60px rgba(124,159,201,0.15)",
        "glow-plasma": "0 0 30px rgba(82,127,176,0.35), 0 0 60px rgba(82,127,176,0.15)",
        "glow-aurora": "0 0 30px rgba(124,159,201,0.35), 0 0 60px rgba(124,159,201,0.15)",
        "glow-gold": "0 0 30px rgba(124,159,201,0.3)",
        "inner-glow": "inset 0 0 30px rgba(82,127,176,0.06)",
        card: "0 4px 24px rgba(1,16,35,0.5), 0 1px 0 rgba(255,255,255,0.04)",
      },
      backdropBlur: {
        glass: "30px",
        xs: "4px",
      },
      keyframes: {
        "pulse-glow": {
          "0%, 100%": { opacity: "0.6", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.08)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-20px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% center" },
          "100%": { backgroundPosition: "200% center" },
        },
        "slide-in": {
          from: { opacity: "0", transform: "translateY(16px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "spin-slow": {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
        "orb-drift": {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "33%": { transform: "translate(30px, -20px) scale(1.05)" },
          "66%": { transform: "translate(-20px, 10px) scale(0.95)" },
        },
      },
      animation: {
        "pulse-glow": "pulse-glow 2.5s ease-in-out infinite",
        float: "float 6s ease-in-out infinite",
        shimmer: "shimmer 2.5s linear infinite",
        "slide-in": "slide-in 0.4s ease forwards",
        "spin-slow": "spin-slow 8s linear infinite",
        "orb-drift": "orb-drift 8s ease-in-out infinite",
        "orb-drift-2": "orb-drift 11s ease-in-out infinite reverse",
        "orb-drift-3": "orb-drift 14s ease-in-out infinite 2s",
      },
    },
  },
  plugins: [],
};
