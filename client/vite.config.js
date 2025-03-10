import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "https://memorable-moments.onrender.com", // Proxy API requests in development
        changeOrigin: true,
        secure: false,
      },
    },
  },
});