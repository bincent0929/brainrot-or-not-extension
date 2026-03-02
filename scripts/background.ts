/**
 * This is the extension service worker.
 * I think I'm going to have this run the inference
 * in the background. It is supposed to run up to 5 minutes
 * by default. Which should be plently of time for inference using
 * the small model that I have being loaded.
 */

/**
 * This will receive the video process signal and start analysis of the video
 * it will return the processed information as a message broadcast 
 * (or save it to the browser's storage. I think the contentScript might need to do that).
 */

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (tab.url && tab.url.includes("youtube.com/watch") && changeInfo.status === "complete") {
    const queryParameters = tab.url.split("?")[1];
    const urlParameters = new URLSearchParams(queryParameters);

    /**
     * this gets sent to the listener constructed below
     * and to the listener in the contentScript
     */
    chrome.tabs.sendMessage(tabId, {
      type: "NEW",
      videoId: urlParameters.get("v"),
    });
  }
});
