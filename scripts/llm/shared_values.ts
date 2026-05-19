import type { modelResponse } from "../types";

import type { Video } from "../types";

import type { ChatWebLLM } from "@langchain/community/chat_models/webllm";

export const prePrompt =
  "You classify YouTube videos for time-value. " +
  "Pick exactly ONE category from: educational, tutorial, informational, news, entertainment, gaming, reaction, drama, mixed. " +
  "Score 0.0 (pure brainrot) to 5.0 (high value), bound to category: " +
  "educational/tutorial/informational/news → 3.5-5.0. " +
  "entertainment/gaming/reaction/drama → 0.0-2.0. " +
  "mixed → 2.0-3.5. " +
  "score_reasoning format: '<category>, <high|low> <signal>'. Max 12 words. " +
  'Reply ONLY as JSON: {"video_score": <float>, "category": "<one>", "score_reasoning": "<string>"}. ' +
  'Example: {"video_score": 4.2, "category": "tutorial", "score_reasoning": "tutorial, high information density"}. ' +
  'Example: {"video_score": 1.0, "category": "reaction", "score_reasoning": "reaction, low informational value"}. ' +
  "Context: brain rot refers to material of low or addictive quality, typically in online media, that preoccupies someone to the point it is said to affect mental functioning. Both the state of preoccupation and resulting mental degradation are known as brain rot.";

export function parseModelJson(content: string): modelResponse {
  const start = content.indexOf("{");
  const end = content.lastIndexOf("}");

  if (start === -1 || end === -1 || end <= start) {
    throw new Error("Model response did not contain a JSON object.");
  }

  const parsed = JSON.parse(content.slice(start, end + 1)) as Record<string, unknown>;
  const score = parseFloat(String(parsed.video_score));

  if (isNaN(score)) {
    throw new Error("Model did not return a valid numeric video_score.");
  }

  return {
    video_score: score,
    score_reasoning: String(parsed.score_reasoning ?? "")
  };
}

export async function transcriptTokenManagement(video: Video, loadedModel: ChatWebLLM, maxTokens: number, outputTokenBudget: number): Promise<string> {
  const maxInputTokens = maxTokens - outputTokenBudget;

  const restPayload = [
    `Video title: ${video.title}`,
    `Channel: ${video.channel_name}`,
    `${prePrompt}`
  ].join("\n");
  
  const restTokenCount = await loadedModel.getNumTokens(restPayload);
  let transcript = video.transcript;
  let transcriptTokenCount = await loadedModel.getNumTokens(`Transcript: ${transcript}`);

  const charsPerToken = transcript.length / transcriptTokenCount;
  let excessTokens = restTokenCount + transcriptTokenCount - maxInputTokens;

  while (excessTokens > 0) {
    // 1.05 accounts for non-linear token boundaries
    const charsToRemove = Math.ceil(excessTokens * charsPerToken * 1.05);
    transcript = transcript.slice(0, transcript.length - charsToRemove);
    transcriptTokenCount = await loadedModel.getNumTokens(`Transcript: ${transcript}`);
    excessTokens = restTokenCount + transcriptTokenCount - maxInputTokens;
  }

  return transcript;
}