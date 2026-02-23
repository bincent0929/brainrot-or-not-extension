!!! The main working file right now is `webgpu-transcript-processing.ts`. The extension isn't functional !!!

!!! The webgpu file runs an LLM in your browser. It will be resource intensive !!!

Install `pnpm`

```sh
curl -fsSL https://get.pnpm.io/install.sh | sh -\n\n
```

`cd` into `scripts/`, then run the below.

Run `pnpm install` to get the dependent packages.

Then run `pnpm vite dev` to start the web server.

Then go to `http://localhost:5173/debug.html` and open up the console in your web browser and wait until your computer runs the inference.

At the moment, the YouTube transcript isn't able to be fetched.
