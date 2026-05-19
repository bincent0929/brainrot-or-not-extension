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

    const selectClass = "w-full rounded-lg border border-slate-600 bg-[rgb(30,38,48)] text-white px-2 py-1 text-sm cursor-pointer";

    return(
        <main className="w-55 p-4 flex flex-col gap-3">
            <h2 className="m-0 text-sm font-bold uppercase tracking-wide text-slate-400">Settings</h2>
            <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-400">Provider</label>
                <select
                    className={selectClass}
                    value={provider}
                    onChange={(e) => {
                        setProvider(e.target.value);
                        setModel(MODELS[e.target.value][0]);
                    }}
                >
                    <option value="deepseek">DeepSeek</option>
                </select>
            </div>
            <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-400">Model</label>
                <select
                    className={selectClass}
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                >
                    {MODELS[provider].map((m) => (
                        <option key={m} value={m}>{m}</option>
                    ))}
                </select>
            </div>
            <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-400">API Key</label>
                <input
                    type="password"
                    className="w-full rounded-lg border border-slate-600 bg-[rgb(30,38,48)] text-white px-2 py-1 text-sm"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="sk-..."
                />
            </div>
            <p className="m-0 text-[11px] text-slate-500">Key stored in local browser storage.</p>
            <div className="flex justify-between gap-2">
                <button type="button" className="btn-primary-red" onClick={onClose}>Cancel</button>
                <button type="button" className="btn-primary-green" onClick={() => void handleSave()}>Save</button>
            </div>
        </main>
    );
}