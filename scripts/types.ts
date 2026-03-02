export interface videoAnalaysisMessageType {
  type: "GRAB_VIDEO_INFO" | "ANALYZE" | "ANALYSIS_FINISHED";
}

export interface youtubeDataAnalysisMessage extends videoAnalaysisMessageType {
  transcript: string, 
  channel_name: string, 
  video_title: string, 
  vidId: string;
}

export interface videoEval extends videoAnalaysisMessageType {
  "score": number;
  "reason": string;
}
