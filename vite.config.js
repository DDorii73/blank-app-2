import { resolve } from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
  envPrefix: ["VITE_", "FIREBASE_"],
  server: {
    host: "0.0.0.0",
    port: 5173,
    strictPort: true,
    allowedHosts: [".loca.lt", ".trycloudflare.com"],
  },
  preview: {
    host: "0.0.0.0",
    port: 5173,
    strictPort: true,
    allowedHosts: [".loca.lt", ".trycloudflare.com"],
  },
  build: {
    rollupOptions: {
      input: {
        index: resolve(__dirname, "index.html"),
        student: resolve(__dirname, "student.html"),
        teacherMonitor: resolve(__dirname, "teacherMonitor.html"),
      },
    },
  },
});
