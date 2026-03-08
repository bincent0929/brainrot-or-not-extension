type YoutubeCaptionTrack = {
  baseUrl: string;
  languageCode?: string;
  kind?: string;
};

type CaptionEvent = {
  segs?: Array<{ utf8?: string }>;
};

type CaptionTrackResponse = {
  events?: CaptionEvent[];
};

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function getCaptionTracksFromPlayerResponse(): YoutubeCaptionTrack[] {
  const win = window as typeof window & {
    ytInitialPlayerResponse?: {
      captions?: {
        playerCaptionsTracklistRenderer?: {
          captionTracks?: YoutubeCaptionTrack[];
        };
      };
    };
  };

  return (
    win.ytInitialPlayerResponse?.captions?.playerCaptionsTracklistRenderer?.captionTracks ?? []
  );
}

function pickPreferredTrack(tracks: YoutubeCaptionTrack[]): YoutubeCaptionTrack | null {
  if (!tracks.length) {
    return null;
  }

  const englishTrack = tracks.find((track) => track.languageCode?.startsWith("en") && track.kind !== "asr");
  if (englishTrack) {
    return englishTrack;
  }

  const firstNonAsr = tracks.find((track) => track.kind !== "asr");
  if (firstNonAsr) {
    return firstNonAsr;
  }

  return tracks[0];
}

function scrapeTranscriptFromDom(): string {
  // Grab all transcript segment nodes
  /**
   * With the current tsconfig this gives an error
   * it can be ignored. The compiled output works.
   */
  const segments = Array.from(document.querySelectorAll("ytd-transcript-segment-renderer"));

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
      const textEl = seg.querySelector("yt-formatted-string.segment-text");
      const tsEl = seg.querySelector(".segment-timestamp");

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

  // For debug
  //console.log("Transcript lines:", lines.length);
  //console.log(transcript);

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
  // Only click "show transcript" controls.
  const clickableCandidates = Array.from(
    document.querySelectorAll<HTMLElement>("button, tp-yt-paper-button")
  );
  const showTranscriptButton = clickableCandidates.find((candidate) => {
    const label = `${candidate.getAttribute("aria-label") ?? ""} ${candidate.textContent ?? ""}`.toLowerCase();
    return label.includes("show transcript");
  });

  if (showTranscriptButton) {
    showTranscriptButton.click();
    await sleep(800);
    return;
  }

  const moreActionsButton = document.querySelector<HTMLElement>(
    "ytd-watch-metadata #actions button[aria-label]"
  );
  moreActionsButton?.click();
  await sleep(500);

  const menuItems = Array.from(
    document.querySelectorAll<HTMLElement>("ytd-menu-service-item-renderer tp-yt-paper-item")
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
  // If transcript was just opened, give YouTube a moment to render segment nodes.
  //const existingDomTranscript = await waitForTranscriptDom(1200); 
  //if (existingDomTranscript) return existingDomTranscript;

  /*
  const byCaptionTrack = await fetchTranscriptFromCaptionTrack();
  if (byCaptionTrack) {
    return byCaptionTrack;
  }
  */

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
