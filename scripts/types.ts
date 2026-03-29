export type Video = {
  id: number;
  video_id: string;
  title: string;
  channel_name: string;
  transcript: string;
  created_at: string; // ISO 8601 datetime string
  video_score: number | null;
  score_reasoning: string | null;
  scored_at: string | null;
  model_used: string | null;
  trained: boolean | null;
  prompt_used: string | null;
};

export type videoEval = {
  video_score: number | null;
  scored_at: string | null;
  model_used: string | null;
  trained: boolean | null;
  prompt_used: string | null;
};

/**
 * The types of the messages should be what should be done to the
 * data in the messsage. Not what data is in the message.
 */

export type messageTypes =
  | GrabVideoInfoMessage
  | youtubeDataMessage
  | videoEvalMessage
  | analysisStatusMessage
  | analysisFailedMessage;

export type youtubeDataMessage = {
  type: "ANALYZE"
  video: Video
}

export interface GrabVideoInfoMessage {
  type: "GRAB_VIDEO_INFO";
}

export interface analysisStatusMessage {
  type: "ANALYZE_STATUS";
  status: string;
}

export interface analysisFailedMessage {
  type: "ANALYZE_FAILED";
  error: string;
}

export interface videoEvalMessage {
  type: "EVALUATE";
}
