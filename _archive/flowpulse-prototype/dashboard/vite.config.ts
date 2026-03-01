import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/mock-api": {
        target: "http://localhost:5055",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/mock-api/, ""),
      },
    },
  },
});
