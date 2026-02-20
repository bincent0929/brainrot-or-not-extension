/*
interface Bookmark {
  time: number;
  desc: string;
}
*/

/*
interface BookmarkMessage {
  type: "NEW" | "PLAY" | "DELETE";
  value?: number;
  videoId?: string;
}
*/

/**
 * I included delete just in case you want a new analysis
 * if the model updated
 */

import { process_transcript } from "./transcript-process";
import type { analyzeVideoMessageVideoId } from "./types";

(() => {
  let youtubeLeftControls;
  let currentVideoId = "";
  //let currentVideo = "";
  //let currentVideoBookmarks = [];

  /**
   * The following two functions are being kept because I think
   * they will be useful in form for creating functions I may need
   * but are not applicable to my program's case.
   */

  /* I don't think I'll need this.
  const fetchBookmarks = (): Promise<Bookmark[]> => {
    return new Promise<Bookmark[]>((resolve) => {
      chrome.storage.sync.get([currentVideo], (obj) => {
        resolve(obj[currentVideo] ? JSON.parse(obj[currentVideo]) : []);
      });
    });
  };
  */

  /*
  const addNewBookmarkEventHandler = async () => {
    const currentTime = youtubePlayer.currentTime;
    const newBookmark = {
      time: currentTime,
      desc: "Bookmark at " + getTime(currentTime),
    };

    currentVideoBookmarks = await fetchBookmarks();

    chrome.storage.sync.set({
      [currentVideo]: JSON.stringify([...currentVideoBookmarks, newBookmark].sort((a, b) => a.time - b.time))
    });
  };
  */

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
