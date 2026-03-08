export type youtubeData = {
  transcript: string,
  channel_name: string,
  video_title: string,
  vidId: string;
};

export type videoEval = {
  score: number;
  summary: string;
  reason: string;
};

export type messageTypes =
  | GrabVideoInfoMessage
  | youtubeDataMessage
  | videoEvalMessage
  | analysisStatusMessage
  | analysisFailedMessage;

export interface GrabVideoInfoMessage {
  type: "GRAB_VIDEO_INFO";
}

export interface youtubeDataMessage {
  type: "ANALYZE";
  youtubeData: youtubeData;
}

export interface videoEvalMessage {
  type: "ANALYZE_SAVED";
  youtubeData: youtubeData;
  videoEval: videoEval;
}

export interface analysisStatusMessage {
  type: "ANALYZE_STATUS";
  status: string;
}

export interface analysisFailedMessage {
  type: "ANALYZE_FAILED";
  error: string;
}
