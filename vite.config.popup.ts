import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "path";

// BUILD 2: popup.html + popup.js as ES module
// The popup runs in an extension page which supports full ESM.
export default defineConfig({
  plugins: [tailwindcss()],
  resolve: {
    conditions: ["browser", "module", "import", "default"],
  },
  define: {
    "process.env.NODE_ENV": JSON.stringify("production"),
  },
  build: {
    outDir: "dist",
    emptyOutDir: false, // Don't wipe build 1's output
    assetsInlineLimit: 0,
    rollupOptions: {
      input: {
        popup: resolve(__dirname, "popup.html"),
      },
      output: {
        format: "es",
        entryFileNames: "[name].js",
        assetFileNames: (assetInfo) =>
          assetInfo.name?.endsWith(".css")
            ? "popup.css"
            : "assets/[name][extname]",
      },
    },
  },
});
