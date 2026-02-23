import { defineConfig } from "vite";

// Dev server config for debug.html / webgpu-transcript-processing.ts.
// Proxies YouTube requests through the local server to avoid CORS errors.
export default defineConfig({
  server: {
    proxy: {
      "/yt-proxy": {
        target: "https://www.youtube.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/yt-proxy/, ""),
      },
    },
  },
});
