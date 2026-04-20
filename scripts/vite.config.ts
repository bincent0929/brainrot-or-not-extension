import { fileURLToPath } from "node:url";

import { crx } from "@crxjs/vite-plugin";
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

import manifest from "../manifest.json";

const rootDir = fileURLToPath(new URL("..", import.meta.url));

export default defineConfig({
  root: rootDir,
  publicDir: false,
  plugins: [tailwindcss(), crx({ manifest })],
  build: {
    outDir: fileURLToPath(new URL("../dist", import.meta.url)),
    emptyOutDir: true,
    chunkSizeWarningLimit: 7000,
  },
});
