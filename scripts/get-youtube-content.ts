/**
 * Functions used by the extension to work with the backend.
 * May have a CORS issue, not really sure.
 */

import type { Video } from "./types";

function grab_vId(): string {
  return new URLSearchParams(window.location.search).get("v") ?? "";
}

export async function fetch_video_text_data(): Promise<Video> {
  const video_id = grab_vId();

  if (video_id === "") {
    Error("The vidoe_id could not be found");
  }

  const res = await fetch("http://localhost:8080/api/transcripts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ video_id: video_id })
  });

  const data: Video = await res.json();

  return data;
}
