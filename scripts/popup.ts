/** About
 * This script has access to the extension's DOM
 * I will use this to have the user initiate the analysis
 * of the transcript.
 * And I will use this to present the analysis to the user when
 * it's finished being processed.
 */

/**
 * This will fetch from the browser's storage once the PROCESSED signal is broadcast
 * to update the pop up UI with the information about the video.
 */

import type { videoAnalaysisMessageType } from "./types.js";
import { getActiveTabURL } from "./utils.js";

/**
 * I want this to add a listner on the button in the popup that sends a
 * message to the page content worker to scrape the page for the channel info
 */
const newVideoLoaded = async () => {
  const analyzeBtnExists = document.getElementsByClassName("analyze-btn")[0];

  if (!analyzeBtnExists) {
    const analyzeBtn = document.createElement("img");

    analyzeBtn.src = chrome.runtime.getURL("assets/bookmark.png");
    analyzeBtn.id = "analyze-btn";
    analyzeBtn.title = "Click to analyze the video's transcript!";

    const analyzeContainer = document.getElementById("analyze-container");

    analyzeContainer.appendChild(analyzeBtn);
    
    /**
     * I want to move this to the background.ts file so that it
     * run as a background worker instead of in the browser where it can be
     * created multiple times per video
     * */
    analyzeBtn.addEventListener("click", async () => {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true
      });
      chrome.tabs.sendMessage(tab.id!, {type: "GRAB_VIDEO_INFO"} satisfies videoAnalaysisMessageType);
    });
  }
};

/**
 * I'm kind of confused why this seems to perform the some of the same sort of logic that
 * background.ts seems to do.
 */
document.addEventListener("DOMContentLoaded", async () => {
  // same logic...
  const activeTab = await getActiveTabURL();
  const queryParameters = activeTab.url.split("?")[1];
  const urlParameters = new URLSearchParams(queryParameters);

  const currentVideo = urlParameters.get("v");
  // same logic.

  if (activeTab.url.includes("youtube.com/watch") && currentVideo) {
    /**
    chrome.storage.sync.get([currentVideo], (data) => {
      const currentVideoBookmarks = data[currentVideo] ? JSON.parse(data[currentVideo]) : [];

      viewAnalyses(currentVideoBookmarks);
      
    });
     */
  } else {
    const container = document.getElementsByClassName("container")[0];

    container.innerHTML = '<div class="title">This is not a youtube video page.</div>';
  }
});
