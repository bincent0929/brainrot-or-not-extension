import type {
  messageTypes,
  Video
} from "./types";

import { processTranscript } from "./webgpu-transcript-processing";

const LAST_ANALYSIS_STORAGE_KEY = "lastAnalysis";

(() => {
  chrome.runtime.onMessage.addListener((obj: messageTypes): boolean => {
    /**
     * This is received from the content script.
     * It contains the video's ID.
     * See contentScript.ts for more.
     */
    if (obj.type !== "ANALYZE") {
      return false;
    }

    (async () => {
      try {
        /**
         * This is sent as an update on the progress of
         * the analysis of the video to the popup.
         * See popup.ts for the receiving.
         */
        const statusMessage: messageTypes = {
          type: "UPDATE_STATUS",
          status: "Running on-device transcript analysis...",
        };
        chrome.runtime.sendMessage(statusMessage);

        const video_data = await processTranscript(obj.video);

        /**
         * This saves the result to the Chromium storage.
         * I think I need to update it to do a little more.
         * I'm not really sure how it's placing it in right now.
         * 
         * I also need to have this send to the backend and have it save there.
         */
        await chrome.storage.local.set({
          [LAST_ANALYSIS_STORAGE_KEY]: {
            ...video_data,
            analyzedAt: Date.now(),
          },
        });

        /**
         * This is sent with the final values of the analysis
         * to the popup.
         * See popup.ts for how it's handled.
         */
        const analysisFinished: messageTypes = {
          type: "PRESENT_ANALYSIS",
          status: "The analysis is finished."
        };

        chrome.runtime.sendMessage(analysisFinished);
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
