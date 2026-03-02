/**
 * This script is given access to the DOM of the page.
 * This will be used to scrape the transcript, channel, and video title
 * All will be sent through inference and returned.
 */

import type { videoAnalaysisMessageType } from "./types";

import { scrapeTranscript, grab_channel, grab_video_title, grab_vId } from "./get-youtube-content";

(() => {
  let currentVideoId = "";

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
  chrome.runtime.onMessage.addListener((obj:videoAnalaysisMessageType, sender, response): boolean | Promise<any> => {
    let 
      transcript: string, 
      channel_name: string, 
      video_title: string, 
      vidId: string;

    switch(obj.type) {
      case "GRAB_VIDEO_INFO":
        transcript = scrapeTranscript();
        channel_name = grab_channel();
        video_title = grab_video_title();
        vidId = grab_vId();
        break;
      default:
        break;
    }

    return true;

  });
})();
