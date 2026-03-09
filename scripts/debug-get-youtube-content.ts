function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
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
 * 
 * @returns the text transcript of the page without timestamps as a full unbroken paragraph
 */
function scrapeTranscript(): string {
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

function grab_channel(): string {
  const channelEl = document.querySelector('yt-formatted-string.ytd-channel-name');
  return channelEl?.textContent?.trim();
}

function grab_video_title(): string {
  const titleEl = document.querySelector('yt-formatted-string.ytd-watch-metadata');
  return titleEl?.textContent?.trim();
}

function grab_vId(): string {
  return new URLSearchParams(window.location.search).get("v") ?? "";
}
