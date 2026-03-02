/**
 * 
 * @returns the text transcript of the page without timestamps as a full unbroken paragraph
 */
export function scrapeTranscript(): string {
  // Grab all transcript segment nodes
  /**
   * With the current tsconfig this gives an error
   * it can be ignored. The compiled output works.
   */
  const segments = Array.from(document.querySelectorAll("ytd-transcript-segment-renderer"));

  if (!segments.length) {
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

export function grab_channel(): string {
  const channelEl = document.querySelector('yt-formatted-string.ytd-channel-name');
  return channelEl?.textContent?.trim();
}

export function grab_video_title(): string {
  const titleEl = document.querySelector('yt-formatted-string.ytd-watch-metadata');
  return titleEl?.textContent?.trim();
}

export function grab_vId(): string {
  return new URLSearchParams(window.location.search).get("v") ?? "";
}
