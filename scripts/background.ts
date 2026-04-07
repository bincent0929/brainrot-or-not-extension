import type { messageTypes, Video } from "./types";

import { processTranscript } from "./webgpu-transcript-processing";

(() => {
  chrome.runtime.onMessage.addListener((obj: messageTypes): boolean => {
    if (obj.type !== "ANALYZE") {
      return false;
    }

    (async () => {
      try {
        const statusMessage: messageTypes = {
          type: "UPDATE_STATUS",
          status: "Analyzing the video...",
        };
        chrome.runtime.sendMessage(statusMessage);

        const analysisFinished: messageTypes = {
          type: "PRESENT_ANALYSIS",
          status: "The analysis is finished.",
          video_id: obj.video.video_id
        };
        
        const cachedResult = 
          await chrome.storage.local.get(obj.video.video_id);
        const cachedResultVideo = 
          cachedResult[obj.video.video_id] as Video | undefined;

        switch (true) {
          case (cachedResultVideo !== undefined 
            && cachedResultVideo.video_score !== null):
            break;
          default:
            const video_data: Video | undefined =
              await processTranscript(obj.video);

            if (!video_data) {
              throw new Error("The video was not able to be scored.")
            }

            await chrome.storage.local.set({
              [video_data.video_id]: video_data,
            });
        }
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
