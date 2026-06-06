import { resolve } from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
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
