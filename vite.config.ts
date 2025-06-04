import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 3000,
    host: true,
  },
  preview: {
    port: 10000, // Render uses port 10000 for web services
    host: "0.0.0.0", // Allow external connections
  },
  build: {
    outDir: "dist", // Default, but being explicit
    sourcemap: false, // Disable sourcemaps for production (optional)
    rollupOptions: {
      output: {
        manualChunks: undefined, // Let Vite handle chunking automatically
      },
    },
  },
});
