import { fileURLToPath } from "node:url";

import { crx } from "@crxjs/vite-plugin";
import { defineConfig } from "vite";

import manifest from "../manifest.json";

const rootDir = fileURLToPath(new URL("..", import.meta.url));

export default defineConfig({
  root: rootDir,
  publicDir: false,
  plugins: [crx({ manifest })],
  build: {
    outDir: fileURLToPath(new URL("../dist", import.meta.url)),
    emptyOutDir: true,
  },
});
