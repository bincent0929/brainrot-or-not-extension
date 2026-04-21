/**
 * Includes functions for processing the video data on the user's
 * GPU locally.
 */

import { ChatWebLLM } from "@langchain/community/chat_models/webllm";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import type { InitProgressReport } from "@mlc-ai/web-llm";

import type { Video, modelResponse } from "./types";

/**
 * This is defined here to avoid loading
 * the model multiple times.
 */
let modelPromise: Promise<ChatWebLLM> | null = null;

/**
 * This is just rippped right from LangChain's website.
 * It sets up the model for receiving prompts
 * and allows you to configure it.
 * @param model_name
 * @returns 
 */
async function modelLoad(model_name: string): Promise<ChatWebLLM> {
  if (!modelPromise) {
    modelPromise = (async () => {
      const model = new ChatWebLLM({
        model: model_name,
        chatOptions: {
          /**
           * temperature is the most important.
           * It's supposed to keep the 
           * response consistent no
           * matter when the model is ran.
           */
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
  'Respond ONLY with JSON in this exact format: {"video_score": <float>, "score_reasoning": "<1-2 sentence summary>"}';

function parseModelJson(content: string): modelResponse {
  const start = content.indexOf("{");
  const end = content.lastIndexOf("}");

  if (start === -1 || end === -1 || end <= start) {
    throw new Error("Model response did not contain a JSON object.");
  }

  const parsed = JSON.parse(content.slice(start, end + 1)) as modelResponse;

  return {
    video_score: parsed.video_score,
    score_reasoning: parsed.score_reasoning
  };
}

export async function processTranscript(video: Video): Promise<Video> | undefined {
  try {
    Object.assign(video, {
      prompt_used: prePrompt, 
      model_used: "Qwen3-4B-q4f16_1-MLC", 
      trained: false
    });

    const loadedModel = await modelLoad(video.model_used);

    const promptPayload = [
      `Video title: ${video.title}`,
      `Channel: ${video.channel_name}`,
      "Transcript:", video.transcript,
    ].join("\n");

    /**
     * The SystemMessage is how the model is
     * supposed to respond to any given input.
     * The HumanMessage is whatever input is given
     * that the model should respond to.
     */
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
      score_reasoning: modelResponse.score_reasoning,
      scored_at: new Date().toISOString()
    });

    if (video.video_score == null || video.score_reasoning == null || video.scored_at == null) {
      throw new Error("Video scoring fields were not properly assigned.");
    }

    return video;
  }
  catch {
    return undefined;
  }
}
