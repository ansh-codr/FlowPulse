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
      },
      boxShadow: {
        glow: "0 20px 60px rgba(88,240,255,0.25)",
      },
      backdropBlur: {
        glass: "30px",
      },
    },
  },
  plugins: [],
};

