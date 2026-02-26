/**
 * This script is given access to the DOM of the page.
 * This will be used to scrape the transcript, channel, and video title
 * All will be sent through inference and returned.
 */

import type { analyzeVideoMessageVideoId } from "./types";

/**
 * I want this to grab the videoId of the YouTube video,
 * the title, and the name of the channel
 */

function grabYouTubeContent() {
  // Grabs me the YouTube title
  const titleEl = document.querySelector('yt-formatted-string.ytd-watch-metadata');
  const title = titleEl?.textContent?.trim();
  // Grabs me the YouTube channel name
  const channelEl = document.querySelector('a.yt-simple-endpoint[href^="/@"]');
  const channelName = channelEl?.textContent?.trim(); // "CaseyNeistat"


}

(() => {
  let youtubeLeftControls;
  let currentVideoId = "";

  const getVideoIdFromUrl = (): string => {
    return new URLSearchParams(window.location.search).get("v") ?? "";
  };

  const analyzeCurrentVideo = async (): Promise<void> => {
    const videoId = currentVideoId || getVideoIdFromUrl();
    if (!videoId) {
      console.error("No YouTube video ID found to analyze.");
      return;
    }

    try {
      const analysis = await process_transcript(videoId);
      console.log("Video analysis complete:", analysis);
    } catch (error) {
      console.error("Failed to analyze transcript:", error);
    }
  };

  const newVideoLoaded = async () => {
    const analyzeBtnExists = document.getElementsByClassName("analyze-btn")[0];

    if (!analyzeBtnExists) {
      const analyzeBtn = document.createElement("img");

      analyzeBtn.src = chrome.runtime.getURL("assets/bookmark.png");
      analyzeBtn.className = "ytp-button " + "analyze-btn";
      analyzeBtn.title = "Click to analyze the video's transcript!";

      youtubeLeftControls = document.getElementsByClassName("ytp-left-controls")[0];

      youtubeLeftControls.appendChild(analyzeBtn);
      
      /**
       * I want to move this to the background.ts file so that it
       * run as a background worker instead of in the browser where it can be
       * created multiple times per video
       * */
      analyzeBtn.addEventListener("click", () => {
        void analyzeCurrentVideo();
      });
    }
  };

  // these try at multiple times to load the button
  window.addEventListener("load", newVideoLoaded);
  document.addEventListener("yt-navigate-finish", newVideoLoaded);

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
