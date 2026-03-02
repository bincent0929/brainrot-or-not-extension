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
  await newVideoLoaded();
});
