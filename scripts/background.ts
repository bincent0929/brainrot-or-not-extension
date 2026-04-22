import type { AnalysisStatus, messageTypes, offscreenMessageTypes, Video } from "./types";

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

/**
 * Top-level listener so Chrome wakes this SW when the offscreen document
 * sends back its result via sendMessage (chrome.storage is not available
 * in offscreen documents).
 */
chrome.runtime.onMessage.addListener((message: messageTypes | offscreenMessageTypes): boolean => {
  if (message.type !== "OFFSCREEN_RESULT" && message.type !== "OFFSCREEN_ERROR") {
    return false;
  }

  (async () => {
    if (message.type === "OFFSCREEN_RESULT") {
      await chrome.storage.local.set({ [message.video.video_id]: message.video });
      await chrome.storage.session.set({
        analysisStatus: { videoId: message.video.video_id, phase: "done" } satisfies AnalysisStatus,
      });
      chrome.runtime.sendMessage({
        type: "PRESENT_ANALYSIS",
        status: "The analysis is finished.",
        video_id: message.video.video_id,
      } satisfies messageTypes).catch(() => {});
      return;
    }

    const session = await chrome.storage.session.get("analysisStatus");
    const status = session.analysisStatus as AnalysisStatus | undefined;
    if (status) {
      await chrome.storage.session.set({
        analysisStatus: { videoId: status.videoId, phase: "failed", error: message.error } satisfies AnalysisStatus,
      });
    }
    chrome.runtime.sendMessage({
      type: "RETURN_ANALYZE_FAILED",
      error: message.error,
    } satisfies messageTypes).catch(() => {});
  })();

  return false;
});

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
        } satisfies messageTypes).catch(() => {});

        const cachedResult = await chrome.storage.local.get(obj.video.video_id);
        const cachedVideo = cachedResult[obj.video.video_id] as Video | undefined;

        if (cachedVideo?.video_score != null) {
          await chrome.storage.session.set({
            analysisStatus: { videoId: obj.video.video_id, phase: "done" } satisfies AnalysisStatus,
          });
          chrome.runtime.sendMessage({
            type: "PRESENT_ANALYSIS",
            status: "The analysis is finished.",
            video_id: obj.video.video_id,
          } satisfies messageTypes).catch(() => {});
          return;
        }

        await chrome.storage.session.set({
          analysisStatus: { videoId: obj.video.video_id, phase: "analyzing" } satisfies AnalysisStatus,
        });

        await ensureOffscreenDocument();

        // Fire and forget — SW can be killed while offscreen runs inference.
        // When offscreen saves the result to local storage, Chrome wakes this SW
        // via the storage.onChanged listener above.
        chrome.runtime.sendMessage({
          type: "OFFSCREEN_ANALYZE",
          target: "offscreen",
          video: obj.video,
        } satisfies offscreenMessageTypes);
      } catch (error) {
        const errMsg = error instanceof Error ? error.message : "Analysis failed in the background worker.";
        await chrome.storage.session.set({
          analysisStatus: { videoId: obj.video.video_id, phase: "failed", error: errMsg } satisfies AnalysisStatus,
        });
        chrome.runtime.sendMessage({
          type: "RETURN_ANALYZE_FAILED",
          error: errMsg,
        } satisfies messageTypes).catch(() => {});
      }
    })();

    return false;
  });
})();
