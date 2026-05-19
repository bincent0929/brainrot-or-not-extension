import { fileURLToPath } from "node:url";

import { crx } from "@crxjs/vite-plugin";
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";

import manifest from "../manifest.json";

const rootDir = fileURLToPath(new URL("..", import.meta.url));

export default defineConfig({
  root: rootDir,
  publicDir: false,
  plugins: [react(), tailwindcss(), crx({ manifest })],
  build: {
    rollupOptions: {
      input: {
        offscreen: fileURLToPath(new URL("../offscreen.html", import.meta.url)),
      },
    },
    outDir: fileURLToPath(new URL("../dist", import.meta.url)),
    emptyOutDir: true,
    chunkSizeWarningLimit: 7000,
  },
});
