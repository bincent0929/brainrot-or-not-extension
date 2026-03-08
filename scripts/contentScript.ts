import type { GrabVideoInfoMessage, youtubeDataMessage } from "./types";

import {
  scrapeTranscript,
  grab_channel,
  grab_video_title,
  grab_vId,
} from "./get-youtube-content";

(() => {
  chrome.runtime.onMessage.addListener((obj: GrabVideoInfoMessage, _sender, sendResponse): boolean => {
    if (obj.type !== "GRAB_VIDEO_INFO") {
      return false;
    }

    sendResponse({ accepted: true });

    (async () => {
      try {
        const transcript = await scrapeTranscript();
        if (!transcript) {
          chrome.runtime.sendMessage({
            type: "ANALYZE_FAILED",
            error:
              "Could not find a transcript for this video. If the creator disabled captions, analysis cannot run.",
          });
          return;
        }

        const message: youtubeDataMessage = {
          type: "ANALYZE",
          youtubeData: {
            transcript,
            channel_name: grab_channel(),
            video_title: grab_video_title(),
            vidId: grab_vId(),
          },
        };
        chrome.runtime.sendMessage(message);
      } catch (error) {
        chrome.runtime.sendMessage({
          type: "ANALYZE_FAILED",
          error: error instanceof Error ? error.message : "Failed to extract YouTube metadata.",
        });
      }
    })();

    return false;
  });
})();
