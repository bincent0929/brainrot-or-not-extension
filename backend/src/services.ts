import { YoutubeTranscript } from "youtube-transcript";

export async function fetchVideoMetadata(
  videoId: string
): Promise<{ title: string; channelName: string }> {
  const url = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch metadata for ${videoId}: ${res.statusText}`);
  }
  const data = (await res.json()) as { title: string; author_name: string };
  return { title: data.title, channelName: data.author_name };
}

const cookieFetch: typeof globalThis.fetch = (url, options) =>
  fetch(url, {
    ...options,
    headers: {
      ...(options as RequestInit)?.headers,
      Cookie: "SOCS=CAI",
    },
  });

export async function fetchTranscript(videoId: string): Promise<string> {
  const items = await YoutubeTranscript.fetchTranscript(videoId, { fetch: cookieFetch });
  return items.map((item) => item.text.replace(/\n/g, " ")).join(" ");
}
