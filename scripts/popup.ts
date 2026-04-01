/**
 * This does exist it's just the tsconfig 
 * or vite config that's making it think it's not here.
 */
import "../styles/popup.css";

import type { messageTypes, Video } from "./types";

function setStatus(message: string): void {
  const statusEl = document.getElementById("status");
  
  if (!statusEl) setStatus("Status element not found.");

  if (statusEl) { 
    statusEl.textContent = message;
  }
}

function setLoading(isLoading: boolean): void {
  const buttonEl = document.getElementById("analyze-btn") as HTMLButtonElement | null;
  
  if (!buttonEl) setStatus("The button element was not found.");

  buttonEl.disabled = isLoading;
  buttonEl.textContent = isLoading ? "Analyzing..." : "Analyze Video";
}

async function renderResult(video_id: string): Promise<void> {
  const resultEl = document.getElementById("result");
  const scoreEl = document.getElementById("score");
  const reasoningEl = document.getElementById("summary");

  if (!resultEl) setStatus("Result element not found.");
  if (!scoreEl) setStatus("Score element not found.");
  if (!reasoningEl) setStatus("Reasoning element not found.");

  if (!resultEl || !scoreEl || !reasoningEl) return;

  const result = 
    await chrome.storage.local.get(video_id);
  const resultVideo = 
    result[video_id] as Video | undefined;

  if (resultVideo !== undefined 
    && resultVideo.video_score !== null) {
    setStatus("The video has not been analyzed.");
    return;
  }

  /**
   * This needs to be changed to pull from the chrome
   * data storage or the backend.
   */
  resultEl.classList.remove("hidden");
  scoreEl.textContent = resultVideo.video_score.toFixed(1);
  reasoningEl.textContent = resultVideo.score_reasoning;

  const title = resultVideo.title || "Current video";
  setStatus(`Analysis complete for "${title}".`);
}

async function analysisRequest(): Promise<void> {
  setLoading(true);
  setStatus("Collecting transcript and metadata from this tab...");

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id || !tab.url?.includes("youtube.com/watch")) {
    setLoading(false);
    setStatus("Open a YouTube watch page first, then run Analyze.");
    return;
  }

  try {
    /**
     * Sends to start analysis of the video on the page.
     * This message is received by the contentScript.ts.
     * See that file for what it does.
     */
    await chrome.tabs.sendMessage(tab.id, { type: "GRAB_VIDEO_INFO" });
  } catch (_error) {
    setLoading(false);
    setStatus("Could not reach content script on this tab. Refresh the YouTube page and try again.");
  }
}

function setupRuntimeListener(): void {
  chrome.runtime.onMessage.addListener((message: messageTypes): boolean => {

    switch (message.type) {
      
      case "UPDATE_STATUS":
        setStatus(message.status);
        return false;
      
      case "PRESENT_ANALYSIS":
        setLoading(false);
        (async () => {
          renderResult(message.video_id);
        })();
        return false;

      case "RETURN_ANALYZE_FAILED":
        setLoading(false);
        setStatus(message.error);
        return false;

      case "RETURN_DATA_FETCH_ERROR":
        setLoading(false);
        setStatus(message.error);
        return false;
      
      default:
        return false;

    }

  });
}

document.addEventListener("DOMContentLoaded", async () => {
  const analyzeButton = document.getElementById("analyze-btn");
  
  analyzeButton?.addEventListener("click", () => {
    analysisRequest();
  });

  setupRuntimeListener();
});
