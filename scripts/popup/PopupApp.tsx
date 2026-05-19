import { useState, useEffect } from "react";
import type { messageTypes, Video, AnalysisStatus } from "../types";

export function PopupApp() {
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState("Click the button to analyze the video!");
    const [result, setResult] = useState<{ score: number; reasoning: string } | null>(null);

    async function fetchVideo(video_id: string) {
        const storedVideo = await chrome.storage.local.get(video_id);
        const video: Video = storedVideo[video_id];
        if (video?.video_score != null) {
            setResult({
                score: video.video_score,
                reasoning: video.score_reasoning ?? ""
            })
        }
        setLoading(false);
    }

    useEffect(() => {
        const handler = (message: messageTypes) => {
            switch (message.type) {
                case "UPDATE_STATUS":
                    setStatus(message.status);
                    return false;
                case "PRESENT_ANALYSIS":
                    void fetchVideo(message.video_id);
                    return false;
                case "RETURN_ANALYZE_FAILED":
                    setLoading(false);
                    setStatus(message.error);
                    return false;
                case "RETURN_DATA_FETCH_ERROR":
                    setLoading(false);
                    setStatus(message.error);
                    return false;
                default:
                    return false;
            }
        }

        chrome.runtime.onMessage.addListener(handler);
        return () => chrome.runtime.onMessage.removeListener(handler); // <- removes the listener when the popup unmounts
    }, []); // <- dependency array

    async function analysisRequest() {
        setLoading(true);
        setStatus("Collecting transcript and metadata from this tab...");

        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!tab?.id || !tab.url?.includes("youtube.com/watch")) {
            setLoading(false);
            setStatus("Open a YouTube watch page first, then run Analyze.");
            return;
        }

        try {
            /**
             * Sends to start analysis of the video on the page.
             * This message is received by the contentScript.ts.
             * See that file for what it does.
             */
            await chrome.tabs.sendMessage(tab.id, { type: "GRAB_VIDEO_INFO" });
        } 
        catch (_error) {
            setLoading(false);
            setStatus("Could not reach content script on this tab. Refresh the YouTube page and try again.");
        }
    }

    async function handleAnalysisStatus(status: AnalysisStatus) {
        switch (status.phase) {
            case "analyzing":
                setLoading(true);
                setStatus("Analyzing the video...");
                break;
            case "done":
                void fetchVideo(status.video_id);
                break;
            case "failed":
                setLoading(false);
                setStatus(status.error);
                break;
        }
    }

    useEffect(() => {
        async function restore() {
            const session = await chrome.storage.session.get("analysisStatus");
            const status = session.analysisStatus as AnalysisStatus | undefined;
            if (!status) return;
        
            handleAnalysisStatus(status);
        }
        void restore();
        
        const onChange = (
            changes: Record<string, chrome.storage.StorageChange>, area: string) => {
            if (area !== "session" || !("analysisStatus" in changes)) 
                return;
            const status = changes.analysisStatus.newValue as AnalysisStatus | undefined;
            if (!status) 
                return;
            
            handleAnalysisStatus(status);
        };

        chrome.storage.onChanged.addListener(onChange);
        return () => chrome.storage.onChanged.removeListener(onChange);
    }, []);

    return (
        <main className="w-55 p-4 flex flex-col gap-3">
            <div className="flex items-center gap-2">
                <img src="assets/ext-icon.png" className="h-7 w-7"/>
                <h1 className="m-0 text-lg font-bold"><span className="text-red-600">Brainrot</span> Or <span className="text-green-400">Not</span></h1>
            </div>
            {
            /**
             * Keeps the elements hidden is the result is presents
             */
            !result && (
                <>
                    <p className="m-0 text-[13px] leading-[1.4]">
                        {status}
                    </p>
                    {!loading && (
                        <button
                            disabled={loading}
                            onClick={() => { void analysisRequest(); }}
                            type="button"
                            className="self-start border-0 rounded-[10px] bg-linear-to-br from-[rgb(240,168,148)] to-[rgb(200,100,75)] text-white text-sm font-bold py-1 px-10 cursor-pointer whitespace-nowrap disabled:opacity-[0.65] disabled:cursor-not-allowed"
                        >
                            Analyze Video
                        </button>
                    )
                    }
                </>
            )}
            
            {
            /**
             * Checks whether result is null or not
             * if it isn't it displays the result.
             * Avoids using hidden.
             */
            result && 
                <section className="rounded-[10px] border border-slate-300 bg-white p-3 flex flex-col gap-[10px] " aria-live="polite">
                    <button
                    onClick={() => {
                        setResult(null);
                        setStatus("Click the button to analyze the video!");
                        void chrome.storage.session.remove("analysisStatus");
                    }}
                    type="button"
                    className="self-end leading-none text-slate-400 hover:text-slate-700 bg-transparent border-0 cursor-pointer text-base p-0"
                    aria-label="Close result"
                    >✕</button>
                    <div className="flex items-center justify-between gap-[10px]">
                    <span className="text-xs text-slate-500 uppercase tracking-[0.03em]">Score</span>
                    <span className="text-2xl font-extrabold text-slate-900">{result.score.toFixed(1)}</span>
                    </div>
                    <div className="flex flex-col items-start gap-[10px]">
                    <span className="text-xs text-slate-500 uppercase tracking-[0.03em]">Reasoning</span>
                    <p className="m-0 text-[13px] leading-[1.45] text-slate-800">{result.reasoning}</p>
                    </div>
                </section>
            }
        
        </main>
    );
}

