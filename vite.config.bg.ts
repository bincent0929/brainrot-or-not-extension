import { defineConfig } from "vite";
import { resolve } from "path";

// background.js — self-contained IIFE bundle for the MV3 service worker.
// Single input required by inlineDynamicImports.
export default defineConfig({
  resolve: {
    conditions: ["browser", "module", "import", "default"],
  },
  define: {
    "process.env.NODE_ENV": JSON.stringify("production"),
  },
  build: {
    outDir: "dist",
    emptyOutDir: false, // contentScript build already cleaned dist/
    assetsInlineLimit: 0,
    rollupOptions: {
      input: resolve(__dirname, "background.ts"),
      output: {
        format: "iife",
        entryFileNames: "background.js",
        inlineDynamicImports: true,
      },
    },
  },
});
