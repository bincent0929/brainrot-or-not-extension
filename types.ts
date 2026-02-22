/**
 * For debugging without a page to grab the title
 * and channel from.
 */
export interface video_rating {
  "video_id": string,
  "transcript": string,
  "model_used": string,
  "score": Number,
}

/**
 * For grabbing all the video info when
 * the page is loading in the extension.
 */
export interface video_rating_and_info extends video_rating {
  "video_title": string,
  "channel_name": string,
}

export interface analyzeVideoMessage {
  type: "ANALYZE" | "NEW";
}

export interface analyzeVideoMessageVideoId extends analyzeVideoMessage {
  videoId?: string;
}