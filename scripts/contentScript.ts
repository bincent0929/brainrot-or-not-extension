import type { messageTypes, Video } from "./types";

import { fetch_video_text_data } from "./get-youtube-content";

(() => {
  chrome.runtime.onMessage.addListener((obj: messageTypes, _sender, sendResponse): boolean => {
    /**
     * Received from the user pressing the analysis button in
     * the popup. 
     * Found in popup.ts.
     */
    if (obj.type !== "GRAB_VIDEO_INFO") {
      return false;
    }

    sendResponse({ accepted: true });

    (async () => {
      const video_data: Video = 
        await fetch_video_text_data();

      switch (true) {
        
        case !video_data.transcript:
          chrome.runtime.sendMessage({
            type: "RETURN_DATA_FETCH_ERROR",
            error:
              "Could not find a transcript for this video. If the creator disabled captions, the transcript cannot be found.",
          });
          return false;

        case (video_data.video_score !== null):
          // if the video has already been scored
          const analysisFinished: messageTypes = {
            type: "PRESENT_ANALYSIS",
            status: "The analysis is finished.",
            video_id: video_data.video_id
          };
          chrome.runtime.sendMessage(analysisFinished);
          
        default:
          const analyzeMessage: messageTypes = {
            type: "ANALYZE",
            video: video_data
          };
          chrome.runtime.sendMessage(analyzeMessage);
          
      }

    })();

    return false;
  });
})();
