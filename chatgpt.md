I want all my scripts wired up in order to operate as an extension. I want to used CRJXS and vite in order to build the extension.

!!Read my README.md for what the files do and the current state of the program!!

I want the extension to be a YouTube extension where the popup is a button that you can press that analyzes the video by taking the text metadata and content information from the video and then outputs a summary and a score.

See get-youtube-content.ts for what content I'm grabbing from the page and see the webgpu-transcript-processing.ts for how that data is being processed.

For the content script I would like for the user to not have to press the "Show Transcript" button. YouTube doesn't load the transcript into the DOM until that button is pressed. Do a search for how to do that.

Ignore my python files. Ignore my debug files. Update the tsconfig.json if needed.

Make sure it all gets packaged into a single folder such as dist or otherwise named.