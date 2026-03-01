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
        night: "#05060a",
        plasma: "#6d6dff",
        aurora: "#9c6bff",
        neon: "#58f0ff",
        ember: "#ff8a8a",
        gold: "#f5c842",
        success: "#4ade80",
        "neon-dim": "rgba(88,240,255,0.15)",
        "plasma-dim": "rgba(109,109,255,0.15)",
      },
      boxShadow: {
        glow: "0 0 40px rgba(88,240,255,0.2), 0 20px 60px rgba(88,240,255,0.1)",
        "glow-sm": "0 0 20px rgba(88,240,255,0.15)",
        "glow-lg": "0 0 80px rgba(88,240,255,0.25), 0 30px 80px rgba(88,240,255,0.15)",
        "glow-neon": "0 0 30px rgba(88,240,255,0.4), 0 0 60px rgba(88,240,255,0.2)",
        "glow-plasma": "0 0 30px rgba(109,109,255,0.4), 0 0 60px rgba(109,109,255,0.2)",
        "glow-aurora": "0 0 30px rgba(156,107,255,0.4), 0 0 60px rgba(156,107,255,0.2)",
        "glow-gold": "0 0 30px rgba(245,200,66,0.4)",
        "inner-glow": "inset 0 0 30px rgba(88,240,255,0.05)",
        card: "0 4px 24px rgba(0,0,0,0.4), 0 1px 0 rgba(255,255,255,0.05)",
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
