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

type newVideoMessage = {
  type: "NEW";
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

  const newVideoLoaded = async () => {
    const analyzeBtnExists = document.getElementsByClassName("analyze-btn")[0];

    if (!analyzeBtnExists) {
      const analyzeBtn = document.createElement("img");

      analyzeBtn.src = chrome.runtime.getURL("assets/bookmark.png");
      analyzeBtn.className = "ytp-button " + "analyze-btn";
      analyzeBtn.title = "Click to analyze the video's transcript!";

      youtubeLeftControls = document.getElementsByClassName("ytp-left-controls")[0];
      youtubePlayer = document.getElementsByClassName('video-stream')[0];

      youtubeLeftControls.appendChild(analyzeBtn);
      
      /**
       * I want to move this to the background.ts file so that it
       * run as a background worker instead of in the browser where it can be
       * created multiple times per video
       * */
      analyzeBtn.addEventListener("click", () => {
        chrome.runtime.sendMessage({type: "ANALYZE"})
      });
    }
  };

  /**
   * This acts in response to any sendMessage initiated.
   * I will need to update this to respond based on how I want it to respond.
   */
  chrome.runtime.onMessage.addListener((obj:newVideoMessage, sender, response): boolean | Promise<any> => {

    switch(obj.type) {
      case "NEW":
        newVideoLoaded();
        break;
      default:
        break;
    }

    return true;

  });
})();
