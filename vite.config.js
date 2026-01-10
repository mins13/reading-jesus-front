import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "예수로교회 대청 리딩지저스",
        short_name: "리딩지저스",
        start_url: "/",
        scope: "/",
        display: "standalone",
        theme_color: "#ffffff",
        background_color: "#ffffff",
        icons: [
          { src: "/v1.png", sizes: "192x192", type: "image/png" },
          { src: "/v2.png", sizes: "512x512", type: "image/png" },
          { src: "/v3.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
    }),
  ],

  // ✅ 기존 로컬 개발용 프록시 유지 (배포에는 영향 없음)
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
      },
    },
  },
});
