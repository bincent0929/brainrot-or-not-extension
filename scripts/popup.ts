import "../styles/popup.css";

import type { messageTypes, Video } from "./types";

/**
 * I'm not really sure what this is right now.
 */
const LAST_ANALYSIS_STORAGE_KEY = "lastAnalysis";

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

function renderResult(video: Video): void {
  const resultEl = document.getElementById("result");
  const scoreEl = document.getElementById("score");
  const reasoningEl = document.getElementById("summary");

  if (!resultEl) setStatus("Result element not found.");
  if (!scoreEl) setStatus("Score element not found.");
  if (!reasoningEl) setStatus("Reasoning element not found.");

  if (!resultEl || !scoreEl || !reasoningEl) return;

  resultEl.classList.remove("hidden");
  scoreEl.textContent = video.video_score.toFixed(1);
  reasoningEl.textContent = video.score_reasoning;

  const title = video.title || "Current video";
  setStatus(`Analysis complete for "${title}".`);
}

async function requestAnalysis(): Promise<void> {
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
    if (message.type === "UPDATE_STATUS") {
      setStatus(message.status);
      return false;
    }

    if (message.type === "RETURN_ANALYZE_FAILED") {
      setLoading(false);
      setStatus(message.error);
      return false;
    }

    if (message.type === "PRESENT_ANALYSIS") {
      setLoading(false);
      renderResult(message.analysis_result);
      return false;
    }

    return false;
  });
}

/*
* This needs to be redone. I'm not even sure where the result is even being saved
* to the Chromium storage.
async function loadPreviousResult(): Promise<void> {
  const stored = await chrome.storage.local.get(LAST_ANALYSIS_STORAGE_KEY);
  const lastAnalysis = stored[LAST_ANALYSIS_STORAGE_KEY] as videoEvalMessage | undefined;

  if (!lastAnalysis?.videoEval) {
    return;
  }

  renderResult(lastAnalysis);
  setStatus("Showing latest completed analysis.");
}
*/

document.addEventListener("DOMContentLoaded", async () => {
  const analyzeButton = document.getElementById("analyze-btn");
  analyzeButton?.addEventListener("click", () => {
    void requestAnalysis();
  });

  setupRuntimeListener();
  //await loadPreviousResult();
});
