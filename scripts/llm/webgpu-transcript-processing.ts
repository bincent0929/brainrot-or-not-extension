/**
 * Includes functions for processing the video data on the user's
 * GPU locally.
 */

import { ChatWebLLM } from "@langchain/community/chat_models/webllm";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import type { InitProgressReport } from "@mlc-ai/web-llm";

import type { Video, modelResponse } from "../types";

import { prePrompt, transcriptTokenManagement, parseModelJson } from "./shared_values";

const maxTokens = 4096;
const outputTokenBudget = 300;

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
          temperature: 0.1,
          context_window_size: maxTokens,
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

export async function processTranscript(video: Video): Promise<Video> | undefined {
  try {
    Object.assign(video, {
      prompt_used: prePrompt, 
      model_used: "gemma-2-2b-it-q4f32_1-MLC", 
      trained: false
    });

    const loadedModel = await modelLoad(video.model_used);

    const transcript = await transcriptTokenManagement(video, loadedModel, maxTokens, outputTokenBudget);

    const promptPayload = [
      `Video title: ${video.title}`,
      `Channel: ${video.channel_name}`,
      "Transcript:", transcript,
    ].join("\n");

    /**
     * The SystemMessage is how the model is
     * supposed to respond to any given input.
     * The HumanMessage is whatever input is given
     * that the model should respond to.
     */
    const response = await loadedModel.invoke(
      [
        new SystemMessage({ content: prePrompt }),
        new HumanMessage({ content: promptPayload }),
      ],
      {
        callbacks: [{
          handleLLMNewToken(token: string) {
            console.log(token);
          },
        }],
      }
    );

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
