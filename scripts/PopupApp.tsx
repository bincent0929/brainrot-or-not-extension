import { useState } from "react";

export function PopupApp() {
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState("Click the button to analyze the video!");
    const [result, setResult] = useState<{ score: number; reasoning: string } | null>(null);


    return (
        <main className="w-55 p-4 flex flex-col gap-3">
        <div className="flex items-center gap-2">
            <img src="assets/ext-icon.png" className="h-7 w-7"/>
            <h1 className="m-0 text-lg font-bold"><span className="text-red-600">Brainrot</span> Or <span className="text-green-400">Not</span></h1>
        </div>
        <p id="status" className="m-0 text-[13px] leading-[1.4]">Click the button to analyze the video!</p>
        <button
            id="analyze-btn"
            type="button"
            className="self-start border-0 rounded-[10px] bg-linear-to-br from-[rgb(240,168,148)] to-[rgb(200,100,75)] text-white text-sm font-bold py-1 px-10 cursor-pointer whitespace-nowrap disabled:opacity-[0.65] disabled:cursor-not-allowed"
        >Analyze Video</button>

        <section id="result" className="rounded-[10px] border border-slate-300 bg-white p-3 flex flex-col gap-[10px] hidden" aria-live="polite">
            <button
            id="close-result-btn"
            type="button"
            className="self-end leading-none text-slate-400 hover:text-slate-700 bg-transparent border-0 cursor-pointer text-base p-0"
            aria-label="Close result"
            >✕</button>
            <div className="flex items-center justify-between gap-[10px]">
            <span className="text-xs text-slate-500 uppercase tracking-[0.03em]">Score</span>
            <span id="score" className="text-2xl font-extrabold text-slate-900">-</span>
            </div>
            <div className="flex flex-col items-start gap-[10px]">
            <span className="text-xs text-slate-500 uppercase tracking-[0.03em]">Summary</span>
            <p id="summary" className="m-0 text-[13px] leading-[1.45] text-slate-800"></p>
            </div>
        </section>
        </main>
    );
}

