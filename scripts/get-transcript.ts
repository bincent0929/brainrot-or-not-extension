/**
 * THIS WORKS PERFECTLY!!!
 * Well, not really perfectly, but it actually gets the transcript
 * 
 * There is a caveat to this parser. This does need access to the user's DOM
 * AND it does need the user to press the "Show Transcript" button on the page
 * because that's what loads all of the transcript into the DOM.
 * 
 * So I'll have to add something in here to checks for whether the elements or loaded or not and returns
 * the error or something. At least for now.
 */
(() => {
  // Grab all transcript segment nodes
  const segments = Array.from(document.querySelectorAll("ytd-transcript-segment-renderer"));

  if (!segments.length) {
    console.warn("No transcript segments found. Make sure the transcript panel is open and loaded.");
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

      // Choose ONE of these return formats:

      // 1) Transcript only (no timestamps)
      return text;

      // 2) Transcript with timestamps
      // return ts ? `${ts} ${text}` : text;
    })
    .filter(Boolean);

  const transcript = lines.join(" ");

  // Output / copy helpers
  console.log("Transcript lines:", lines.length);
  console.log(transcript);

  // Try to copy to clipboard (may require user gesture depending on context)
  navigator.clipboard?.writeText(transcript).then(
    () => console.log("Copied transcript to clipboard ✅"),
    () => console.log("Could not copy automatically; transcript is in console.")
  );

  // Also return it for easy pasting in DevTools
  return transcript;
})();