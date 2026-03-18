import type {
  analysisFailedMessage,
  analysisStatusMessage,
  messageTypes,
  videoEvalMessage,
  youtubeDataMessage,
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
        const statusMessage: analysisStatusMessage = {
          type: "ANALYZE_STATUS",
          status: "Running on-device transcript analysis...",
        };
        chrome.runtime.sendMessage(statusMessage);

        const dataMessage = obj as youtubeDataMessage;
        const videoEval = await processTranscript(dataMessage.video);

        const resultMessage: videoEvalMessage = {
          type: "ANALYZE_SAVED",
          youtubeData: dataMessage.youtubeData,
          videoEval,
        };

        await chrome.storage.local.set({
          [LAST_ANALYSIS_STORAGE_KEY]: {
            ...resultMessage,
            analyzedAt: Date.now(),
          },
        });

        chrome.runtime.sendMessage(resultMessage);
      } catch (error) {
        const failedMessage: analysisFailedMessage = {
          type: "ANALYZE_FAILED",
          error: error instanceof Error ? error.message : "Analysis failed in the background worker.",
        };
        chrome.runtime.sendMessage(failedMessage);
      }
    })();

    return true;
  });
})();
