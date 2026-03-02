/**
 * This script is given access to the DOM of the page.
 * This will be used to scrape the transcript, channel, and video title
 * All will be sent through inference and returned.
 */

import type { analyzeVideoMessageVideoId } from "./types";

import { scrapeTranscript, grab_channel, grab_video_title, grab_vId } from "./get-youtube-content";

(() => {
  let currentVideoId = "";
  const transcript = scrapeTranscript();
  const channel_name = grab_channel();
  const video_title = grab_video_title();
  const vidId = grab_vId();

  const analyzeCurrentVideo = async (): Promise<void> => {
    const videoId = currentVideoId || getVideoIdFromUrl();
    if (!videoId) {
      console.error("No YouTube video ID found to analyze.");
      return;
    }

    try {
      /**
       * Instead of this, a message should be broadcast of
       * type analysis and received by the "background" service
       * worker to process.
       */
      const analysis = await process_transcript(videoId);
      console.log("Video analysis complete:", analysis);
    } catch (error) {
      console.error("Failed to analyze transcript:", error);
    }
  };

  /**
   * This acts in response to any sendMessage initiated.
   * I will need to update this to respond based on how I want it to respond.
   */
  chrome.runtime.onMessage.addListener((obj:analyzeVideoMessageVideoId, sender, response): boolean | Promise<any> => {

    switch(obj.type) {
      case "NEW":
        currentVideoId = obj.videoId ?? getVideoIdFromUrl();
        newVideoLoaded();
        break;
      default:
        break;
    }

    return true;

  });
})();
