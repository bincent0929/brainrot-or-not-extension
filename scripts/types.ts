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

export type modelResponse = 
  Pick<Video, "video_score" | "score_reasoning">;

/**
 * The types of the messages should be what should be done to the
 * data in the messsage. Not what data is in the message.
 */

export type messageTypes =
  | GrabVideoInfoMessage
  | analyzeMessage
  | videoEvalMessage
  | analysisUpdateMessage
  | analysisFailedMessage
  | presentAnalysisMessage;

type analyzeMessage = {
  type: "ANALYZE"
  video: Video
}

type GrabVideoInfoMessage = {
  type: "GRAB_VIDEO_INFO";
}

type analysisUpdateMessage = {
  type: "UPDATE_STATUS";
  status: string;
}

type analysisFailedMessage = {
  type: "RETURN_ANALYZE_FAILED";
  error: string;
}

type videoEvalMessage = {
  type: "EVALUATE";
}

type presentAnalysisMessage = {
  type: "PRESENT_ANALYSIS",
  analysis_result: Video
}