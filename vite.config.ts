import { defineConfig } from "vite";
import { viteStaticCopy } from "vite-plugin-static-copy";
import { resolve } from "path";

// contentScript.js — self-contained IIFE bundle.
// Also handles static file copying and cleans dist/ before building.
// Content scripts cannot load split chunks, so inlineDynamicImports is required,
// which mandates a single entry per build.
export default defineConfig({
  plugins: [
    viteStaticCopy({
      targets: [
        { src: "manifest.json", dest: "." },
        { src: "assets/*", dest: "assets" },
        // ONNX Runtime WASM files needed by @huggingface/transformers at runtime.
        // Listed in web_accessible_resources in manifest.json so the content
        // script can load them via chrome.runtime.getURL().
        {
          src: "node_modules/@huggingface/transformers/dist/ort-wasm-simd-threaded.jsep.wasm",
          dest: ".",
        },
        {
          src: "node_modules/@huggingface/transformers/dist/ort-wasm-simd-threaded.jsep.mjs",
          dest: ".",
        },
      ],
    }),
  ],
  resolve: {
    conditions: ["browser", "module", "import", "default"],
  },
  define: {
    "process.env.NODE_ENV": JSON.stringify("production"),
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    assetsInlineLimit: 0,
    rollupOptions: {
      input: resolve(__dirname, "contentScript.ts"),
      output: {
        format: "iife",
        entryFileNames: "contentScript.js",
        inlineDynamicImports: true,
      },
    },
  },
});
