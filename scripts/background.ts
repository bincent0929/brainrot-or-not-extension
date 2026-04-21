import type { messageTypes, offscreenMessageTypes, Video } from "./types";

const OFFSCREEN_URL = chrome.runtime.getURL("offscreen.html");

async function ensureOffscreenDocument(): Promise<void> {
  const existing = await chrome.runtime.getContexts({
    contextTypes: ["OFFSCREEN_DOCUMENT"],
    documentUrls: [OFFSCREEN_URL],
  });
  if (existing.length > 0) return;

  await chrome.offscreen.createDocument({
    url: OFFSCREEN_URL,
    reasons: ["IFRAME_SCRIPTING"],
    justification: "Run WebGPU inference via web-llm in a document with GPU access",
  });
}

function analyzeInOffscreen(video: Video): Promise<Video> {
  return new Promise((resolve, reject) => {
    /**
     * Waits for the WebGPU work to finish on the offscreen
     * document.
     * resolve() returns the video it receives
     * @param message 
     * @returns 
     */
    function listener(message: offscreenMessageTypes): boolean {
      if (message.type === "OFFSCREEN_RESULT" && message.target === "background") {
        chrome.runtime.onMessage.removeListener(listener);
        resolve(message.video);
      } else if (message.type === "OFFSCREEN_ERROR" && message.target === "background") {
        chrome.runtime.onMessage.removeListener(listener);
        reject(new Error(message.error));
      }
      return false;
    }

    chrome.runtime.onMessage.addListener(listener);

    chrome.runtime.sendMessage({
      type: "OFFSCREEN_ANALYZE",
      target: "offscreen",
      video,
    } satisfies offscreenMessageTypes);
  });
}

(() => {
  chrome.runtime.onMessage.addListener((obj: messageTypes): boolean => {
    if (obj.type !== "ANALYZE") {
      return false;
    }

    (async () => {
      try {
        chrome.runtime.sendMessage({
          type: "UPDATE_STATUS",
          status: "Analyzing the video...",
        } satisfies messageTypes);

        const cachedResult = await chrome.storage.local.get(obj.video.video_id);
        const cachedResultVideo = cachedResult[obj.video.video_id] as Video | undefined;

        if (cachedResultVideo === undefined || cachedResultVideo.video_score === null) {
          await ensureOffscreenDocument();
          const video_data = await analyzeInOffscreen(obj.video);
          await chrome.storage.local.set({ [video_data.video_id]: video_data });
        }

        chrome.runtime.sendMessage({
          type: "PRESENT_ANALYSIS",
          status: "The analysis is finished.",
          video_id: obj.video.video_id,
        } satisfies messageTypes);
      } catch (error) {
        chrome.runtime.sendMessage({
          type: "RETURN_ANALYZE_FAILED",
          error: error instanceof Error
            ? error.message
            : "Analysis failed in the background worker.",
        } satisfies messageTypes);
      }
    })();

    return false;
  });
})();
