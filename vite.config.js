import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("/src/data/stories.js") || id.includes("\\src\\data\\stories.js")) {
            return "stories";
          }

          return undefined;
        },
      },
    },
  },
});
