Type messages by what you want to happen (intent/action), not by what data they carry.

# Brainrot or Not

## Purpose

This extension is made to help you make sure you're not wasting your time watching whatever YouTube video you click on.

To help you, when you click on a video, you can click on the extension and it will analyze the video's information **on your computer** and let you know whether the video is *brainrot* -something that's just entertainment- or educational or productive, like a lecture or self-improvement video.

## Languages and Libraries

> [!NOTE]
> These are what are currently being used and may be updated to include more or less.

- HTML
- Typescript
  - multiple LangChain libraries
    - A WebGPU library to run the model on the user's browser
  - pnpm
    - For managing packages
- TailwindCSS

> [!IMPORTANT]
> The extension is now wired with CRXJS + Vite and can be built directly into a single `dist/` folder.

> [!NOTE]
> The webgpu file runs an LLM in your browser. It will be resource intensive.

![](extension-flow-diagram.svg)

## Setup

Install `pnpm`

```sh
curl -fsSL https://get.pnpm.io/install.sh | sh -
```

`cd` into `scripts/`, then run:

Run `pnpm install` to get the dependent packages.

### Extension Development

`cd` into `scripts/`

Run `pnpm dev` to build and watch extension changes.

Run `pnpm build` to create a production build in `../dist`.

Then in Chrome:
1. Open `chrome://extensions`
2. Enable Developer Mode
3. Click "Load unpacked"
4. Select the generated `dist` folder

> [!NOTE]
> Transcript extraction no longer requires manual "Show transcript" clicks. The content script first pulls caption tracks directly and only falls back to clicking transcript UI when needed.

## Extension Organization

`manifest.json` is what decides which script is what.

In my case:
- `background.ts` is the service worker for the extension.
  - This service worker runs the WebGPU transcript analysis and broadcasts status/results.
  - By the MV3 specification, this can run for up to 5 minutes, by default. Which should be enough for the small model I have.
- `contentScript` is the script that gets access to the DOM of the YouTube web pages
  - This grabs transcript + metadata from the active YouTube page.
- `popup.ts` is the script that controls the DOM of the extension itself
  - This provides the Analyze button and displays score + summary.

and these last two are hooking into the extension specific scripts for getting information and processing that information:
- `webgpu-transcript-processing.ts`
    - This script takes a transcript and has an LLM process it into an output, as defined by the `prePrompt` in the script.
    - The function in this will be adapted to take and process a transcript fetched from the user's page.
Speaking of fetching a transcript from the page:
- `get-youtube-content.ts`
    - This script fetches transcript text plus metadata from the current watch page.
    - It tries caption-track fetching first, then falls back to transcript panel scraping.
