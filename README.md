!!! The main working file right now is `webgpu-transcript-processing.ts`. The extension isn't functional !!!

!!! The webgpu file runs an LLM in your browser. It will be resource intensive !!!

## Debugging Inference

Install `pnpm`

```sh
curl -fsSL https://get.pnpm.io/install.sh | sh -\n\n
```

`cd` into `scripts/`, then run the below.

Run `pnpm install` to get the dependent packages.

Then run `pnpm vite dev` to start the web server.

Then go to `http://localhost:5173/debug.html` and open up the console in your web browser and wait until your computer runs the inference.

At the moment, the YouTube transcript isn't able to be fetched.

## Extension Organization

`manifest.json` is what decides which script is what.

In my case:
- `background.ts` is the service worker for the extension.
  - This service worker will be used to initiate the processing of the transcript in the background for the user.
  - By the MV3 specification, this can run for up to 5 minutes, by default. Which should be enough for the small model I have.
- `contentScript` is the script that gets access to the DOM of the YouTube web pages
  - I will use this to initiate grabbing the transcript from the page.
- `popup.ts` is the script that controls the DOM of the extension itself
  - This will be used to build the UI/UX for the user to interact with

and these last two are hooking into the extension specific scripts for getting information and processing that information:
- `webgpu-transcript-processing.ts`
    - This script takes a transcript and has an LLM process it into an output, as defined by the `prePrompt` in the script.
    - The function in this will be adapted to take and process a transcript fetched from the user's page.
Speaking of fetching a transcript from the page:
- `get-transcript.ts`
    - This script just straight up grabs the transcript from the page.
    - !!!! You do need to have clicked the "Show Transcript" button that's in the description of YouTube videos !!!!
      - The plan for this is to just tell the user to click the button for now, or see if I can have the `contentScript.ts` do it somehow.
    - The run this, just go ahead and just `pnpm tsc` and copy the Javascript into your browser's console on a YouTube page, and you should receive the transcript of the video!
