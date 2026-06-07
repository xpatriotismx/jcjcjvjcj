import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": "https://sehemistan-api.onrender.com",
      "/ws": {
        target: "https://sehemistan-api.onrender.com",
        ws: true
      }
    }
  },
  build: {
    sourcemap: true,
    target: "es2022"
  }
});
