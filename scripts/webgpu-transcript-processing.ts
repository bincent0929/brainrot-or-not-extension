/**
 * Includes functions for processing the video data on the user's
 * GPU locally.
 */

import { ChatWebLLM } from "@langchain/community/chat_models/webllm";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { InitProgressReport } from "@mlc-ai/web-llm";

import type { Video, modelResponse } from "./types";

let modelPromise: Promise<ChatWebLLM> | null = null;

async function modelLoad(model_name: string): Promise<ChatWebLLM> {
  if (!modelPromise) {
    modelPromise = (async () => {
      const model = new ChatWebLLM({
        model: model_name,
        chatOptions: {
          temperature: 0.1,
          context_window_size: 10000,
        },
      });

      await model.initialize((progress: InitProgressReport) => {
        console.log(progress);
      });

      return model;
    })();
  }

  return modelPromise;
}

const prePrompt =
  "You evaluate whether a YouTube video is worth the viewer's time. " +
  "If it is educational, practical, or high-signal, score it higher. " +
  "If it is mostly entertainment, score it lower. " +
  "Use a 0.0 to 5.0 scale where 0.0 is pure entertainment/brainrot and 5.0 is deeply educational/productive. " +
  'Respond ONLY with JSON in this exact format: {"score": <float>, "summary": "<1-2 sentence summary>"';

function parseModelJson(content: string): modelResponse {
  const start = content.indexOf("{");
  const end = content.lastIndexOf("}");

  if (start === -1 || end === -1 || end <= start) {
    throw new Error("Model response did not contain a JSON object.");
  }

  const parsed = JSON.parse(content.slice(start, end + 1)) as Partial<videoEval>;

  if (typeof parsed.video_score !== "number") {
    throw new Error("Model response is missing a numeric score.");
  }

  return {
    video_score: Math.max(0, Math.min(5, parsed.video_score)),
    summary: typeof parsed.summary === "string" ? parsed.summary : "Summary not provided.",
    reason: typeof parsed.reason === "string" ? parsed.reason : "No reason provided.",
  };
}

export async function processTranscript(video: Video): Promise<Video> {
  Object.assign(video, {
    prompt_used: prePrompt, 
    model_used: "Llama-3.2-1B-Instruct-q4f16_1-MLC", 
    trained: false
  });

  const loadedModel = await modelLoad(video.model_used);

  const promptPayload = [
    `Video title: ${video.title}`,
    `Channel: ${video.channel_name}`,
    "Transcript:", video.transcript,
  ].join("\n");

  const response = await loadedModel.invoke([
    new SystemMessage({
      content: prePrompt,
    }),
    new HumanMessage({ content: promptPayload }),
  ]);

  if (!response) {
    throw new Error("The inference crashed.");
  }

  const contentStr =
    typeof response.content === "string"
      ? response.content
      : (response.content as { text: string }[])[0]?.text ?? "";
  const modelResponse: modelResponse = parseModelJson(contentStr);

  Object.assign(video, {
    video_score: modelResponse.video_score, 
    score_reasoning: modelResponse.score_reasoning
  });

  return video;
}
