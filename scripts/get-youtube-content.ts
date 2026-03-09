function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function scrapeTranscriptFromDom(): string {
  /**
   * With the current tsconfig this gives an error
   * it can be ignored. The compiled output works.
   */
  const segments = Array.from(document.querySelectorAll("transcript-segment-view-model"));
  if (!segments.length) {
    /**
     * This should eventually send something to update
     * the extension's UI. NOT the console.
     */
    console.warn("No transcript segments found. Go into the video's description and click the \"Show Transcript\" button.");
    return;
  }
  // Extract text from each segment
  const lines = segments
    .map(seg => {
      const textEl = seg.querySelector(".yt-core-attributed-string");
      const tsEl = seg.querySelector(".ytwTranscriptSegmentViewModelTimestamp");
      const text = (textEl?.textContent || "").trim();
      const ts = (tsEl?.textContent || "").trim();
      // Skip empty entries
      if (!text) return null;
      // Transcript only (no timestamps)
      return text;
      // Transcript with timestamps
      // return ts ? `${ts} ${text}` : text;
    })
    .filter(Boolean);
  const transcript = lines.join(" ");
  return transcript;
}

async function waitForTranscriptDom(timeoutMs = 7000): Promise<string> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const transcript = scrapeTranscriptFromDom();
    if (transcript) {
      return transcript;
    }

    await sleep(250);
  }

  return "";
}

async function clickShowTranscriptButton(): Promise<void> {
  const clickableCandidates = Array.from(
    document.querySelectorAll<HTMLElement>("button, tp-yt-paper-button")
  );
  const transcriptButton = clickableCandidates.find((candidate) => {
    const label = `${candidate.getAttribute("aria-label") ?? ""} ${candidate.textContent ?? ""}`.toLowerCase();
    return label.includes("show transcript") || label.includes("transcript");
  });

  if (transcriptButton) {
    transcriptButton.click();
    await sleep(800);
    return;
  }

  const hiddenTranscriptPanel = document.querySelector<HTMLElement>(
    'ytd-engagement-panel-section-list-renderer[target-id*="transcript"][visibility="ENGAGEMENT_PANEL_VISIBILITY_HIDDEN"]'
  );
  if (hiddenTranscriptPanel) {
    hiddenTranscriptPanel.setAttribute("visibility", "ENGAGEMENT_PANEL_VISIBILITY_EXPANDED");
    await sleep(500);
    return;
  }

  const moreActionsButton = document.querySelector<HTMLElement>(
    "ytd-watch-metadata #actions button[aria-label], ytd-watch-metadata #menu button[aria-label], #actions #button-shape button[aria-label]"
  );
  moreActionsButton?.click();
  await sleep(500);

  const menuItems = Array.from(
    document.querySelectorAll<HTMLElement>(
      "ytd-menu-popup-renderer tp-yt-paper-item, tp-yt-paper-listbox tp-yt-paper-item, ytd-popup-container ytd-menu-service-item-renderer"
    )
  );

  const transcriptMenuItem = menuItems.find((item) =>
    item.textContent?.toLowerCase().includes("transcript")
  );

  transcriptMenuItem?.click();
  await sleep(800);
}

/**
 * Pulls transcript text for the active YouTube watch page.
 * Strategy:
 * 1) Use caption track JSON endpoint from player response (no UI click required).
 * 2) Fallback to opening transcript UI automatically and scraping transcript DOM.
 */
export async function scrapeTranscript(): Promise<string> {
  await clickShowTranscriptButton();
  return waitForTranscriptDom();
}

export function grab_channel(): string {
  const channelEl = document.querySelector("yt-formatted-string.ytd-channel-name");
  return channelEl?.textContent?.trim() ?? "";
}

export function grab_video_title(): string {
  const titleEl = document.querySelector("yt-formatted-string.ytd-watch-metadata");
  return titleEl?.textContent?.trim() ?? "";
}

export function grab_vId(): string {
  return new URLSearchParams(window.location.search).get("v") ?? "";
}
