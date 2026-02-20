export type video_rating_and_info = {
    "video_id": string,
    "video_title": string,
    "channel_name": string,
    "transcript": string,
    "model_used": string,
    "score": Number,
}

export interface analyzeVideoMessage {
  type: "ANALYZE" | "NEW";
}

export interface analyzeVideoMessageVideoId extends analyzeVideoMessage {
  videoId?: string;
}