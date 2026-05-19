import { useState, useEffect } from "react";
import type { Settings } from "../types.ts"

type Props = { onClose: () => void };

export function SettingsPanel({ onClose }: Props) {
    const [provider, setProvider] = useState("deepseek");
    const [model, setModel] = useState("deepseek-v4-flash");
    const [apiKey, setApiKey] = useState("");

    const MODELS: Record<string, string[]> = {
        deepseek: ["deepseek-v4-flash", "deepseek-v4-pro"]
    }

    useEffect(() => {
        chrome.storage.local.get("apiSettings").then((data) => {
            const settings = data.apiSettings as Settings | undefined;

            if (settings) {
                setProvider(settings.provider);
                setModel(settings.model);
                setApiKey(settings.apiKey);
            }
        });
    }, []);

    async function handleSave() {
        await chrome.storage.local.set({
            apiSettings: {
                provider, model, apiKey
            }
        });
        onClose();
    }

    return(
        <main>
            <select 
                value={provider}
                onChange={(e) => {
                    setProvider(e.target.value);
                    // sets it to the first model value
                    setModel(MODELS[e.target.value][0]);
                }}
            >
                <option value="deepseek">DeepSeek</option>
            </select>
            <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
            >
                {MODELS[provider].map((m) => (
                    <option key={m} value={m}>{m}</option>
                ))}
            </select>
            <input type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} />
            <button
                type="button"
                onClick={ onClose }
            >
                Cancel
            </button>
            <button
                type="button"
                onClick={() => {
                    void handleSave();
                }}
            >
                Save
            </button>
        </main>
    );
}