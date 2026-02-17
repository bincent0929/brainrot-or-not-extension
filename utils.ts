export async function getActiveTabURL() {
    const tabs = await chrome.tabs.query({
        currentWindow: true,
        active: true
    });
  
    return tabs[0];
}

async function fetchTranscript(videoId: string): Promise<string> {
    const response = await fetch(`https://www.youtube.com/watch?v=${videoId}`);
    const html = await response.text();

    // apparently this "extracts the serialized ytInitialPlayerResponse" which is jsoon
    const match = html.match(/"captions":(\{.*?"playerCaptionsTracklistRenderer".*?\}),\s*"videoDetails"/s);
    if(!match) return "";

    const captions = JSON.parse(match[1]);
    const captionTrack = captions?.playerCaptionsTracklistRenderer?.captionTrack?.[0];
    if (!captionTrack?.baseUrl) return "";

    const transcriptRes = await fetch(captionTrack.baseUrl + "&fmt=json3");
    const data = await transcriptRes.json();

    return data.events
        .filter((e: any) => e.segs) // keeps out metadata
        .map((e: any) => e.segs.map((s: any) => s.utf8).join("")) // joins each caption into a string
        .join(" "); // joins everything with a space between
}