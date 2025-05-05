import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  build: {
    outDir: "dist",
    rollupOptions: {
      input: {
        content: "src/content.ts",
        popup: "src/popup/popup.js",
      },
      output: {
        entryFileNames: "[name].js",
      },
    },
  },
  publicDir: "public",
});
