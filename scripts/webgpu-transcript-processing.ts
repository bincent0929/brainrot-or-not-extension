import { ChatWebLLM } from "@langchain/community/chat_models/webllm";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { InitProgressReport } from "@mlc-ai/web-llm";

import type { videoEval, youtubeData } from "./types";

let modelPromise: Promise<ChatWebLLM> | null = null;

async function modelLoad(): Promise<ChatWebLLM> {
  if (!modelPromise) {
    modelPromise = (async () => {
      const model = new ChatWebLLM({
        model: "Llama-3.2-1B-Instruct-q4f16_1-MLC",
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
  'Respond ONLY with JSON in this exact format: {"score": <float>, "summary": "<1-2 sentence summary>", "reason": "<brief explanation for score>"}';

function parseModelJson(content: string): videoEval {
  const start = content.indexOf("{");
  const end = content.lastIndexOf("}");

  if (start === -1 || end === -1 || end <= start) {
    throw new Error("Model response did not contain a JSON object.");
  }

  const parsed = JSON.parse(content.slice(start, end + 1)) as Partial<videoEval>;

  if (typeof parsed.score !== "number") {
    throw new Error("Model response is missing a numeric score.");
  }

  return {
    score: Math.max(0, Math.min(5, parsed.score)),
    summary: typeof parsed.summary === "string" ? parsed.summary : "Summary not provided.",
    reason: typeof parsed.reason === "string" ? parsed.reason : "No reason provided.",
  };
}

export async function processTranscript(youtubeData: youtubeData): Promise<videoEval> {
  const model = await modelLoad();

  const promptPayload = [
    `Video title: ${youtubeData.video_title || "Unknown"}`,
    `Channel: ${youtubeData.channel_name || "Unknown"}`,
    `Video ID: ${youtubeData.vidId || "Unknown"}`,
    "Transcript:",
    youtubeData.transcript,
  ].join("\n");

  const startTime = Date.now();
  const response = await model.invoke([
    new SystemMessage({
      content: prePrompt,
    }),
    new HumanMessage({ content: promptPayload }),
  ]);
  const inferenceMs = Date.now() - startTime;

  if (!response) {
    throw new Error("The inference crashed.");
  }

  const contentStr =
    typeof response.content === "string"
      ? response.content
      : (response.content as { text: string }[])[0]?.text ?? "";
  const modelResponse = parseModelJson(contentStr);

  console.log(modelResponse);
  console.log(`Inference time: ${inferenceMs}ms`);

  return modelResponse;
}
