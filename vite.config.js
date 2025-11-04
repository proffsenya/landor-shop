import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: "::",
    port: 8081,
    proxy: {
      "/api": {
        target: "http://localhost:8080", // твой бэкенд
        changeOrigin: true,
        secure: false,
        // если бэк отдает 301/302 без /api — можно раскомментить
        // rewrite: (p) => p.replace(/^\/api/, ""),
      },
    },
    fs: {
      allow: ["./client", "./index.html"],
    },
  },
  build: {
    outDir: "dist",
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(process.cwd(), "./client"),
    },
  },
});
