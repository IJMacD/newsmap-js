import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  base: "/",
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "https://news.google.com/",
        changeOrigin: true,
        headers: {
          referer: "https://news.google.com/",
        },
        autoRewrite: true,
        rewrite: (s) => s.replace(/^\/api/, ""),
      },
    },
  },
});
