import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: "auto",
      strategies: "injectManifest",
      srcDir: "src",
      filename: "sw.ts",
      devOptions: {
        enabled: true,
        type: "module",
      },
      manifest: {
        name: "Recetas de Cocina",
        short_name: "Ejemplao PWA",
        description: "Ejemplo de PWA creada",
        display: "standalone",
        display_override: ["window-controls-overlay"],
        start_url: ".",
        lang: "es-ES",
        background_color: "#d4d4d4",
        theme_color: "#19223c",
        icons: [
          {
            src: "/icons/Burger_192.webp",
            sizes: "192x192",
            type: "image/webp",
            purpose: "any",
          },
          {
            src: "/icons/Burger_512.webp",
            sizes: "512x512",
            type: "image/webp",
            purpose: "any",
          },
          {
            src: "/icons/Burger_144.webp",
            sizes: "144x144",
            type: "image/webp",
            purpose: "any",
          },
        ],
        screenshots: [
          {
            src: "/screenshots/Burger_desktop.webp",
            sizes: "1280x720",
            type: "image/webp",
            form_factor: "wide",
            label: "Vista de escritorio de la app de recetas",
          },
          {
            src: "/screenshots/Burger_mobile.webp",
            sizes: "720x1280",
            type: "image/webp",
            form_factor: "narrow",
            label: "Vista móvil de la app de recetas",
          },
        ],
      },
    }),
  ],
  server: {
    host: true,
  },
});
