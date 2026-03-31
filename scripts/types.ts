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
  | grabVideoInfoMessage
  | analyzeMessage
  | analysisUpdateMessage
  | analysisFailedMessage
  | presentAnalysisMessage
  | dataFetchError;

/**
 * Sent: by popup.ts when the user clicks analysis button.
 * Received: by contentScript.ts. Tells it to get the video ID from the page.
 */
type grabVideoInfoMessage = {
  type: "GRAB_VIDEO_INFO";
}

/**
 * Sent: by contentScript.ts when it can't get the transcript
 * and other video information from the backend.
 * Received: by popup.ts to display the issue to the user.
 */
type dataFetchError = {
  type: "RETURN_DATA_FETCH_ERROR",
  error: string;
}

/**
 * Sent: by the contentScript.ts when it has all the information
 * about the video.
 * Received: by background.ts so that it can pass it to the LLM to process it.
 */
type analyzeMessage = {
  type: "ANALYZE"
  video: Video
}

/**
 * Sent: by background.ts to communicate that processing with start.
 * Received: by popup.ts to display the update.
 */
type analysisUpdateMessage = {
  type: "UPDATE_STATUS";
  status: string;
}

/**
 * Sent: by background.ts. Contains the analysis result
 * Received: by popup.ts to display to the user.
 * (Maybe will change to not send data but rather communicate
 * that the data has been saved to the chrome storage)
 */
type presentAnalysisMessage = {
  type: "PRESENT_ANALYSIS",
  analysis_result: Video
}

/**
 * Sent: by background.ts. Informs of any errors
 * with the LLM processing the video's information.
 * Received: by popup.ts to display to the user.
 */
type analysisFailedMessage = {
  type: "RETURN_ANALYZE_FAILED";
  error: string;
}

