import "./popup.css";

import type { AnalysisStatus, messageTypes, Video } from "./types";

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
  const statusEl = document.getElementById("status");
  const buttonEl = document.getElementById("analyze-btn") as HTMLButtonElement | null;

  if (!resultEl) setStatus("Result element not found.");
  if (!scoreEl) setStatus("Score element not found.");
  if (!reasoningEl) setStatus("Reasoning element not found.");

  if (!resultEl || !scoreEl || !reasoningEl || !statusEl || !buttonEl) return;

  const result = await chrome.storage.local.get(video_id);
  const resultVideo = result[video_id] as Video | undefined;

  if (resultVideo === undefined || resultVideo.video_score === null) {
    setStatus("The video has not been analyzed.");
    return;
  }

  statusEl.classList.add("hidden");
  buttonEl.classList.add("hidden");
  resultEl.classList.remove("hidden");
  scoreEl.textContent = resultVideo.video_score.toFixed(1);
  reasoningEl.textContent = resultVideo.score_reasoning;
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

/**
 * Reads chrome.storage.session to restore UI if the popup was closed mid-analysis.
 * The background SW writes analysisStatus whenever the state changes.
 */
async function restoreStateFromSession(): Promise<void> {
  const session = await chrome.storage.session.get("analysisStatus");
  const status = session.analysisStatus as AnalysisStatus | undefined;
  if (!status) return;

  switch (status.phase) {
    case "analyzing":
      setLoading(true);
      setStatus("Analyzing the video...");
      break;
    case "done":
      await renderResult(status.videoId);
      break;
    case "failed":
      setLoading(false);
      setStatus(status.error);
      break;
  }
}

function resetToAnalyzeScreen(): void {
  const resultEl = document.getElementById("result");
  const statusEl = document.getElementById("status");
  setStatus("Click the button to analyze the video!");
  const buttonEl = document.getElementById("analyze-btn");

  resultEl?.classList.add("hidden");
  statusEl?.classList.remove("hidden");
  buttonEl?.classList.remove("hidden");
}

document.addEventListener("DOMContentLoaded", async () => {
  const analyzeButton = document.getElementById("analyze-btn");
  const closeButton = document.getElementById("close-result-btn");

  analyzeButton?.addEventListener("click", () => {
    analysisRequest();
  });

  closeButton?.addEventListener("click", () => {
    resetToAnalyzeScreen();
  });

  setupRuntimeListener();

  // Restore UI from session in case the popup was closed mid-analysis.
  await restoreStateFromSession();

  // Also watch session storage for live status changes. This catches the case where
  // the popup is open but missed a PRESENT_ANALYSIS message (e.g. popup was
  // re-opening just as the result came in).
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== "session" || !("analysisStatus" in changes)) return;
    const status = changes.analysisStatus.newValue as AnalysisStatus | undefined;
    if (!status) return;

    switch (status.phase) {
      case "done":
        setLoading(false);
        renderResult(status.videoId);
        break;
      case "failed":
        setLoading(false);
        setStatus(status.error);
        break;
    }
  });
});
