import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Build para celular: bundle chico, sin targets de navegadores viejos para no cargar polyfills.
export default defineConfig({
  plugins: [react()],
  build: {
    target: "es2020",
    cssCodeSplit: true,
  },
});
