import { ChatWebLLM } from "@langchain/community/chat_models/webllm";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { InitProgressReport } from '@mlc-ai/web-llm';

import transcriptsAndPrompt from "../assets/transcripts.json";

import type { videoEval } from "./types";

async function modelLoad() {
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
}

const prePrompt = transcriptsAndPrompt.prePrompt;
// change this to pick a different transcript
// look in the transcript.json to see which transcripts you can select from.
const transcript = transcriptsAndPrompt.transcript3;
async function processTranscript(): Promise<videoEval> {
    const model = await modelLoad();

    // Call the model with a message and await the response.
    console.log("Running the model on the transcript...")
    const startTime = Date.now();
    const response = await model.invoke([
        new SystemMessage({
            content: prePrompt
        }),
        new HumanMessage({ content: transcript }),
    ]);
    const inferenceMs = Date.now() - startTime;
    
    if(!response) {
        throw Error("The inference crashed.")
    }

    /**
     * This literaly grabs the string from the output
     */
    const contentStr = typeof response.content === "string"
        ? response.content
        : (response.content as { text: string }[])[0].text;

    const modelResponse: videoEval = JSON.parse(contentStr);
 
    console.log(modelResponse);
    console.log(`Inference time: ${inferenceMs}ms`);

    return modelResponse;
}

async function main() {
    //await getYoutubeTranscript();
    await processTranscript();
}
void main();