import type { GrabVideoInfoMessage, Video, analysisMessage } from "./types";

import { fetch_video_text_data } from "./get-youtube-content";

(() => {
  chrome.runtime.onMessage.addListener((obj: GrabVideoInfoMessage, _sender, sendResponse): boolean => {
    if (obj.type !== "GRAB_VIDEO_INFO") {
      return false;
    }

    sendResponse({ accepted: true });

    (async () => {
      const video_data: Video = await fetch_video_text_data();
      if (!video_data.transcript) {
        chrome.runtime.sendMessage({
          type: "RETURN_DATA_FETCH_ERROR",
          error:
            "Could not find a transcript for this video. If the creator disabled captions, the transcript cannot be found.",
        });
        return;
      }

      const message: analysisMessage = {
        type: "ANALYZE",
        video: video_data
      };
      chrome.runtime.sendMessage(message);
    })();

    return false;
  });
})();
