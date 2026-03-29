import type {
  messageTypes,
  Video
} from "./types";

import { processTranscript } from "./webgpu-transcript-processing";

const LAST_ANALYSIS_STORAGE_KEY = "lastAnalysis";

(() => {
  chrome.runtime.onMessage.addListener((obj: messageTypes): boolean => {
    if (obj.type !== "ANALYZE") {
      return false;
    }

    (async () => {
      try {
        const statusMessage: messageTypes = {
          type: "UPDATE_STATUS",
          status: "Running on-device transcript analysis...",
        };
        chrome.runtime.sendMessage(statusMessage);

        const videoEval = await processTranscript(obj.video);

        const resultMessage: messageTypes = {
          type: "PRESENT_ANALYSIS",
          youtubeData: obj.video,
          video_eval: videoEval,
        };

        await chrome.storage.local.set({
          [LAST_ANALYSIS_STORAGE_KEY]: {
            ...resultMessage,
            analyzedAt: Date.now(),
          },
        });

        chrome.runtime.sendMessage(resultMessage);
      } catch (error) {
        const failedMessage: messageTypes = {
          type: "RETURN_ANALYZE_FAILED",
          error: error instanceof Error ? 
            error.message : "Analysis failed in the background worker.",
        };
        chrome.runtime.sendMessage(failedMessage);
      }
    })();

    return true;
  });
})();
