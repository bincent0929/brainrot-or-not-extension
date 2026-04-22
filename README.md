# Brainrot or Not

> [!info] Definnition
>Brainrot (or Brain Rot or Brain-Rot)
>*noun*
>"mindless digital content; the fixation on it and harmful mental effects of it"

You ever find yourself scrolling through YouTube just looking for something to take up your time. Not something truly interesting or important, but just something that'll take up your time?

This extension is meant to help you avoid that!

Through taking the transcript, channel name, and video title of the video, an LLM on **your** computer in **your browser** processes the video based on the prompt defined in `webgpu-transcript-processing.ts` to tell you whether the video you may want to watch is worthwhile.
## Supported Platforms
This extension has been tested to work on Chromium browsers using Apple's Mac systems and Window's systems. Please submit issues about anything issues running on your system!
## Dev Installation
### Package Installation And Building
### Package Installation

> [!warning] Package Management
> You can try and use standard `pip` and/or `npm` to install the Javascript and/or Python packages.
> Though, it is recommended to install and use [uv](https://docs.astral.sh/uv/) and [pnpm](https://pnpm.io/) for package management in the fashion defined below.

To get the extension up and running you will first want to download its packages.
#### Python Packages
`uv pip install -r requirements.txt`
#### Javascript Packages
`cd scripts/ && pnpm install`
### Building
`cd scripts/ && pnpm build`

This will compile everything together using [CRXJS](https://crxjs.dev/) and [Vite](https://vite.dev/) into `dist/` in the root of the repository.

Then in your choice of Chromium based browser you will:
1. Open `chrome://extensions`
2. Enable `Developer Mode`
3. Click "Load unpacked"
4. Select the generated `dist/`
5. Use the extension!

> [!warning]
> The WEBGPU runs an LLM in **your browser**. It will be resource intensive and may take a while.
