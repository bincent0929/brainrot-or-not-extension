interface Bookmark {
  time: number;
  desc: string;
}

interface BookmarkMessage {
  type: "NEW" | "PLAY" | "DELETE";
  value?: number;
  videoId?: string;
}

(() => {
  let youtubeLeftControls, youtubePlayer;
  let currentVideo = "";
  let currentVideoBookmarks = [];

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

  /**
   * I could easily repurpose this to act as my video evaluation button.
  const newVideoLoaded = async () => {
    const bookmarkBtnExists = document.getElementsByClassName("bookmark-btn")[0];

    currentVideoBookmarks = await fetchBookmarks();

    if (!bookmarkBtnExists) {
      const bookmarkBtn = document.createElement("img");

      bookmarkBtn.src = chrome.runtime.getURL("assets/bookmark.png");
      bookmarkBtn.className = "ytp-button " + "bookmark-btn";
      bookmarkBtn.title = "Click to bookmark current timestamp";

      youtubeLeftControls = document.getElementsByClassName("ytp-left-controls")[0];
      youtubePlayer = document.getElementsByClassName('video-stream')[0];

      youtubeLeftControls.appendChild(bookmarkBtn);
      bookmarkBtn.addEventListener("click", addNewBookmarkEventHandler);
    }
  };
  */

  /**
   * This acts in response to any sendMessage initiated.
   * I will need to update this to respond based on how I want it to respond.
   */
  chrome.runtime.onMessage.addListener((obj:BookmarkMessage, sender, response): boolean | Promise<any> => {
    const { type, value, videoId } = obj; // I need to define this data type and then I should make good progress

    if (type === "NEW") {
      currentVideo = videoId;
      newVideoLoaded();
    } else if (type === "PLAY") {
      youtubePlayer.currentTime = value;
    } else if ( type === "DELETE") {
      (async () => {
        const fresh = await fetchBookmarks();
        currentVideoBookmarks = fresh.filter((b) => b.time != value);
        chrome.storage.sync.set({ [currentVideo]: JSON.stringify(currentVideoBookmarks) });
        response(currentVideoBookmarks);
      })();
      return true;
    }
  });

  newVideoLoaded();
})();

const getTime = t => {
  var date = new Date(0);
  date.setSeconds(t);

  return date.toISOString().substr(11, 8);
};
