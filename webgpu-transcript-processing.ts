/**
 * To run this make sure and install `pnpm`
 * Then run `pnpm install` to get the dependencies
 * Finally run `pnpm vite dev` and go to debug.html
 * and look at the console.log to see the model load
 * and run inference on the text.
 */
import { ChatWebLLM } from "@langchain/community/chat_models/webllm";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { InitProgressReport } from '@mlc-ai/web-llm';

import type { video_rating, video_rating_and_info } from './types';

async function processTranscript(): Promise<void> {
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

    const prePrompt = `You will evaluate whether the transcript you are given is worth the time of the user. If it's educational or productive, you'll give it a high score. If it's for entertainment or pleasure, give it a lower score. The goal is to help the user get an idea of whether they're better off watching something else with their time. You'll score it from 0.0 to 5.0. With 0.0 being purely entertainment or "brainrot"; like a live stream recording or Reality TV episode. And 5.0 being something educational, productive, or powerful like a University lecture, TED Talk, or otherwise. Respond ONLY with a JSON object in this format: {"score": <float>, "reason": "<brief reason>"}`

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

    console.log(response.content);
    console.log(`Inference time: ${inferenceMs}ms`);
}

async function main() {
    await processTranscript()
}
void main();
