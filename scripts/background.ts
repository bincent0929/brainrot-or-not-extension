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

import type { youtubeDataMessage, videoEvalMessage } from "./types";

import { processTranscript } from "./webgpu-transcript-processing";

// need to import the webpu processing

(() => {
  chrome.runtime.onMessage.addListener((obj: youtubeDataMessage, _sender, _response): boolean => {

    switch(obj.type) {
      case "ANALYZE":
        (async () => {
          /**
           * Right now this just sends the message.
           * I want to change this to save the result
           * to storage.
           */
          const message: videoEvalMessage = {
            type: "ANALYZE_SAVED",
            videoEval: await processTranscript(obj.youtubeData),
          };
          chrome.runtime.sendMessage(message);
        })();
        break;
      default:
        break;
    }

    return true;
  });
})();
