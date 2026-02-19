import { process_transcript } from "./transcript-process";

interface Bookmark {
  time: number;
  desc: string;
}

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
type analyzeVideoMessage = {
  type: "ANALYZE";
  videoId?: string;
}

(() => {
  let youtubeLeftControls, youtubePlayer;
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

  const newVideoLoaded = async (video_id: string) => {
    const analyzeBtnExists = document.getElementsByClassName("analyze-btn")[0];

    if (!analyzeBtnExists) {
      const analyzeBtn = document.createElement("img");

      analyzeBtn.src = chrome.runtime.getURL("assets/bookmark.png");
      analyzeBtn.className = "ytp-button " + "bookmark-btn";
      analyzeBtn.title = "Click to bookmark current timestamp";

      youtubeLeftControls = document.getElementsByClassName("ytp-left-controls")[0];
      youtubePlayer = document.getElementsByClassName('video-stream')[0];

      youtubeLeftControls.appendChild(analyzeBtn);
      
      // sets up to run analysis when the button is clicked
      analyzeBtn.addEventListener("click", () => process_transcript(video_id));
    }
  };

  /**
   * This acts in response to any sendMessage initiated.
   * I will need to update this to respond based on how I want it to respond.
   */
  chrome.runtime.onMessage.addListener((obj:analyzeVideoMessage, sender, response): boolean | Promise<any> => {
    const { type, videoId } = obj; // I need to define this data type and then I should make good progress

    if (type === "ANALYZE") {
      newVideoLoaded(videoId);
    }

    return true;

  });
})();
