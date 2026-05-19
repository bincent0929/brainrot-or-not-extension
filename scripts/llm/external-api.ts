import { prePrompt, transcriptTokenManagement, parseModelJson } from "./shared_values";

import { ChatDeepSeek } from '@langchain/deepseek';

import type { Settings } from "../types";

new ChatDeepSeek({
    model: settings.model,

})