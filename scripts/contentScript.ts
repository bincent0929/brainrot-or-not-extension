/**
 * This script is given access to the DOM of the page.
 * This will be used to scrape the transcript, channel, and video title
 * All will be sent through inference and returned.
 */

import type { videoAnalaysisMessageType, youtubeDataAnalysisMessage } from "./types";

import { scrapeTranscript, grab_channel, grab_video_title, grab_vId } from "./get-youtube-content";

(() => {
  chrome.runtime.onMessage.addListener((obj:videoAnalaysisMessageType, sender, response): boolean | Promise<any> => {

    switch(obj.type) {
      case "GRAB_VIDEO_INFO":
        const message: youtubeDataAnalysisMessage = {
          type: "ANALYZE",
          transcript: scrapeTranscript(),
          channel_name: grab_channel(),
          video_title: grab_video_title(),
          vidId: grab_vId()
        };
        chrome.runtime.sendMessage(message);
        break;
      default:
        break;
    }

    return true;
  });
})();
