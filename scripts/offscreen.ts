/**
 * This is required for running WEBGPU tasks on Windows computers.
 * It takes the offscreen HTML document that's created by the background.ts service worker
 * and runs the webGPU script on it. Which allows it to get around the restrictive isolation of GPU
 * work on Windows computers.
 */
import type { offscreenMessageTypes } from "./types";

import { processTranscript } from "./webgpu-transcript-processing";

chrome.runtime.onMessage.addListener((message: offscreenMessageTypes): boolean => {
  if (message.type !== "OFFSCREEN_ANALYZE" || message.target !== "offscreen") {
    return false;
  }

  (async () => {
    try {
      const video = await processTranscript(message.video);

      if (!video) {
        throw new Error("The video was not able to be scored.");
      }

      chrome.runtime.sendMessage({
        type: "OFFSCREEN_RESULT",
        target: "background",
        video,
      } satisfies offscreenMessageTypes);
    } catch (error) {
      chrome.runtime.sendMessage({
        type: "OFFSCREEN_ERROR",
        target: "background",
        error: error instanceof Error ? error.message : "Offscreen processing failed.",
      } satisfies offscreenMessageTypes);
    }
  })();

  return true;
});
