/**
 * Includes functions for processing the video data on the user's
 * GPU locally.
 */

import { ChatWebLLM } from "@langchain/community/chat_models/webllm";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import type { InitProgressReport } from "@mlc-ai/web-llm";

import type { Video, modelResponse } from "./types";

const maxTokens = 4096;

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

const prePrompt =
  "You judge YouTube videos. Is it worth the viewer's time? " +
  "Educational, practical, tutorial, informational, news → score high. " +
  "Entertainment, reality tv, gaming, reaction, drama → score low. " +
  "Scale 0.0 to 5.0. 0.0 = pure brainrot. 5.0 = learning/productive. " +
  "score_reasoning: one sentence, maximum 12 words. Name the signal type and whether value is high or low. " +
  "No plot summary. No opinion on content quality. " +
  'Reply ONLY as JSON: {"video_score": <float 0.0-5.0>, "score_reasoning": "<12 words max>"}';

function parseModelJson(content: string): modelResponse {
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

async function transcriptTokenManagement(video: Video, loadedModel: ChatWebLLM): Promise<string> {
  const restPayload = [
    `Video title: ${video.title}`,
    `Channel: ${video.channel_name}`,
    `${prePrompt}`
  ].join("\n");
  
  const restTokenCount = await loadedModel.getNumTokens(restPayload);
  let transcript = video.transcript;
  let transcriptTokenCount = await loadedModel.getNumTokens(`Transcript: ${transcript}`);

  const charsPerToken = transcript.length / transcriptTokenCount;
  let excessTokens = restTokenCount + transcriptTokenCount - maxTokens;

  while (excessTokens > 0) {
    // 1.05 accounts for non-linear token boundaries
    const charsToRemove = Math.ceil(excessTokens * charsPerToken * 1.05);
    transcript = transcript.slice(0, transcript.length - charsToRemove);
    transcriptTokenCount = await loadedModel.getNumTokens(`Transcript: ${transcript}`);
    excessTokens = restTokenCount + transcriptTokenCount - maxTokens;
  }

  return transcript;
}

export async function processTranscript(video: Video): Promise<Video> | undefined {
  try {
    Object.assign(video, {
      prompt_used: prePrompt, 
      model_used: "gemma-2-2b-it-q4f32_1-MLC", 
      trained: false
    });

    const loadedModel = await modelLoad(video.model_used);

    const transcript = await transcriptTokenManagement(video, loadedModel);

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
