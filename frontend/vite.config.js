import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "");
  const backend = env.BACKEND_URL || "http://localhost:8000";
  const ia = env.IA_URL || "http://localhost:8001";

  return {
    server: {
      host: true,
      proxy: {
        "/api": { target: backend, changeOrigin: true, rewrite: (chemin) => chemin.replace(/^\/api/, "") },
        "/ia": { target: ia, changeOrigin: true, rewrite: (chemin) => chemin.replace(/^\/ia/, "") },
      },
    },
    plugins: [
      react(),
      VitePWA({
        registerType: "autoUpdate",
        includeAssets: ["favicon.png", "apple-touch-icon.png"],
        manifest: {
          name: "Laafi Rose",
          short_name: "Laafi Rose",
          description: "S’informer, se protéger, vivre mieux",
          lang: "fr",
          theme_color: "#C82A6C",
          background_color: "#FDF9FB",
          display: "standalone",
          start_url: "/",
          icons: [
            { src: "icone-192.png", sizes: "192x192", type: "image/png" },
            { src: "icone-512.png", sizes: "512x512", type: "image/png" },
          ],
        },
        workbox: {
          globPatterns: ["**/*.{js,css,html,svg,png,woff2}"],
          navigateFallbackDenylist: [/^\/api/, /^\/ia/],
        },
      }),
    ],
  };
});
