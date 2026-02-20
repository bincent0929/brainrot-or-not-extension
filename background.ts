import { process_transcript } from "./transcript-process";
import type { analyzeVideoMessage } from "./types";

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

chrome.runtime.onMessage.addListener((obj:analyzeVideoMessage, sender, response): boolean | Promise<any> => {
  let video_id: string = "";

  switch (obj.type) {
    case "NEW":
      video_id = obj.videoId;
      break;
    case "ANALYZE":
      process_transcript(video_id);
      break;
    default:
      break;
  }

  return true;

});