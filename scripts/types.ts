export type youtubeData = {
  transcript: string, 
  channel_name: string, 
  video_title: string, 
  vidId: string;
}

export type videoEval = {
  "score": number;
  "reason": string;
}

export interface messageTypes {
  type: "GRAB_VIDEO_INFO" | "ANALYZE" | "ANALYZE_SAVED";
}

export interface youtubeDataMessage extends messageTypes {
  youtubeData: youtubeData
}

export interface videoEvalMessage extends messageTypes {
  videoEval: videoEval;
}
