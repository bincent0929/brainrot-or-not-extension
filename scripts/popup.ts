import "../styles/popup.css";

import type { messageTypes, videoEvalMessage } from "./types";

const LAST_ANALYSIS_STORAGE_KEY = "lastAnalysis";

function setStatus(message: string): void {
  const statusEl = document.getElementById("status");
  if (statusEl) {
    statusEl.textContent = message;
  }
}

function setLoading(isLoading: boolean): void {
  const button = document.getElementById("analyze-btn") as HTMLButtonElement | null;
  if (!button) {
    return;
  }

  button.disabled = isLoading;
  button.textContent = isLoading ? "Analyzing..." : "Analyze Video";
}

function renderResult(message: videoEvalMessage): void {
  const resultEl = document.getElementById("result");
  const scoreEl = document.getElementById("score");
  const summaryEl = document.getElementById("summary");
  const reasonEl = document.getElementById("reason");

  if (!resultEl || !scoreEl || !summaryEl || !reasonEl) {
    return;
  }

  resultEl.classList.remove("hidden");
  scoreEl.textContent = message.videoEval.score.toFixed(1);
  summaryEl.textContent = message.videoEval.summary;
  reasonEl.textContent = message.videoEval.reason;

  const title = message.youtubeData.video_title || "Current video";
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
    await chrome.tabs.sendMessage(tab.id, { type: "GRAB_VIDEO_INFO" });
  } catch (_error) {
    setLoading(false);
    setStatus("Could not reach content script on this tab. Refresh the YouTube page and try again.");
  }
}

function setupRuntimeListener(): void {
  chrome.runtime.onMessage.addListener((message: messageTypes): boolean => {
    if (message.type === "ANALYZE_STATUS") {
      setStatus(message.status);
      return false;
    }

    if (message.type === "ANALYZE_FAILED") {
      setLoading(false);
      setStatus(message.error);
      return false;
    }

    if (message.type === "ANALYZE_SAVED") {
      setLoading(false);
      renderResult(message);
      return false;
    }

    return false;
  });
}

async function loadPreviousResult(): Promise<void> {
  const stored = await chrome.storage.local.get(LAST_ANALYSIS_STORAGE_KEY);
  const lastAnalysis = stored[LAST_ANALYSIS_STORAGE_KEY] as videoEvalMessage | undefined;

  if (!lastAnalysis?.videoEval) {
    return;
  }

  renderResult(lastAnalysis);
  setStatus("Showing latest completed analysis.");
}

document.addEventListener("DOMContentLoaded", async () => {
  const analyzeButton = document.getElementById("analyze-btn");
  analyzeButton?.addEventListener("click", () => {
    void requestAnalysis();
  });

  setupRuntimeListener();
  await loadPreviousResult();
});
