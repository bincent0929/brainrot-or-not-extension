import { getActiveTabURL } from "./utils.js";

const addNewBookmark = (bookmarks, bookmark) => {
  const bookmarkTitleElement = document.createElement("div");
  const controlsElement = document.createElement("div");
  const newBookmarkElement = document.createElement("div");

  bookmarkTitleElement.textContent = bookmark.desc;
  bookmarkTitleElement.className = "bookmark-title";
  controlsElement.className = "bookmark-controls";

  setBookmarkAttributes("play", onPlay, controlsElement);
  setBookmarkAttributes("delete", onDelete, controlsElement);

  newBookmarkElement.id = "bookmark-" + bookmark.time;
  newBookmarkElement.className = "bookmark";
  newBookmarkElement.setAttribute("timestamp", bookmark.time);

  newBookmarkElement.appendChild(bookmarkTitleElement);
  newBookmarkElement.appendChild(controlsElement);
  bookmarks.appendChild(newBookmarkElement);
};

const viewBookmarks = (currentBookmarks=[]) => {
  const bookmarksElement = document.getElementById("bookmarks");
  bookmarksElement.innerHTML = "";

  if (currentBookmarks.length > 0) {
    for (let i = 0; i < currentBookmarks.length; i++) {
      const bookmark = currentBookmarks[i];
      addNewBookmark(bookmarksElement, bookmark);
    }
  } else {
    bookmarksElement.innerHTML = '<i class="row">No bookmarks to show</i>';
  }

  return;
};

const onPlay = async e => {
  const bookmarkTime = e.target.parentNode.parentNode.getAttribute("timestamp");
  const activeTab = await getActiveTabURL();

  chrome.tabs.sendMessage(activeTab.id, {
    type: "PLAY",
    value: bookmarkTime,
  });
};

const onDelete = async e => {
  const activeTab = await getActiveTabURL();
  const bookmarkTime = e.target.parentNode.parentNode.getAttribute("timestamp");
  const bookmarkElementToDelete = document.getElementById(
    "bookmark-" + bookmarkTime
  );

  bookmarkElementToDelete.parentNode.removeChild(bookmarkElementToDelete);

  const response = await chrome.tabs.sendMessage(activeTab.id, {
    type: "DELETE",
    value: bookmarkTime,
  });
  viewBookmarks(response);
};

const setBookmarkAttributes =  (src, eventListener, controlParentElement) => {
  const controlElement = document.createElement("img");

  controlElement.src = "assets/" + src + ".png";
  controlElement.title = src;
  controlElement.addEventListener("click", eventListener);
  controlParentElement.appendChild(controlElement);
};

async function fetchTranscript(videoId: string): Promise<string> {
    const response = await fetch(`https://www.youtube.com/watch?v=${videoId}`);
    const html = await response.text();

    // apparently this "extracts the serialized ytInitialPlayerResponse" which is jsoon
    const match = html.match(/"captions":(\{.*?"playerCaptionsTracklistRenderer".*?\}),\s*"videoDetails"/s);
    if(!match) return "";

    const captions = JSON.parse(match[1]);
    const captionTrack = captions?.playerCaptionsTracklistRenderer?.captionTracks?.[0];
    if (!captionTrack?.baseUrl) return "";

    const transcriptRes = await fetch(captionTrack.baseUrl + "&fmt=json3");
    const data = await transcriptRes.json();

    console.log("Returning data...");

    return data.events
        .filter((e: any) => e.segs) // keeps out metadata
        .map((e: any) => e.segs.map((s: any) => s.utf8).join("")) // joins each caption into a string
        .join(" "); // joins everything with a space between
}


document.addEventListener("DOMContentLoaded", async () => {
  const activeTab = await getActiveTabURL();
  const queryParameters = activeTab.url.split("?")[1];
  const urlParameters = new URLSearchParams(queryParameters);

  const currentVideo = urlParameters.get("v");

  if (activeTab.url.includes("youtube.com/watch") && currentVideo) {
    chrome.storage.sync.get([currentVideo], (data) => {
      const currentVideoBookmarks = data[currentVideo] ? JSON.parse(data[currentVideo]) : [];

      viewBookmarks(currentVideoBookmarks);
      console.log(await fetchTranscript(currentVideo));
    });
  } else {
    const container = document.getElementsByClassName("container")[0];

    container.innerHTML = '<div class="title">This is not a youtube video page.</div>';
  }
});
