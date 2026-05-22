import "dotenv/config";
import express, { Request, Response } from "express";
import cors from "cors";
import prisma from "./prisma";
import { fetchVideoMetadata, fetchTranscript } from "./services";

const app = express();
const PORT = process.env.PORT ?? 8080;

app.use(express.json());
app.use(cors({ origin: ["https://www.youtube.com"] }));

// POST /api/transcripts
// Body: { video_id: string }
// Returns the existing record if already saved, otherwise fetches and stores it.
app.post("/api/transcripts", async (req: Request, res: Response) => {
  const videoId = (req.body.video_id ?? "").trim();
  if (!videoId) {
    res.status(400).json({ error: "video_id is required" });
    return;
  }

  const existing = await prisma.video.findUnique({ where: { videoId } });
  if (existing) {
    res.json(existing);
    return;
  }

  try {
    const [metadata, transcript] = await Promise.all([
      fetchVideoMetadata(videoId),
      fetchTranscript(videoId),
    ]);
    const video = await prisma.video.create({
      data: {
        videoId,
        title: metadata.title,
        channelName: metadata.channelName,
        transcript,
      },
    });
    res.status(201).json(video);
  } catch (err) {
    res.status(502).json({ error: (err as Error).message });
  }
});

// GET /api/videos
// Returns all saved videos, newest first.
app.get("/api/videos", async (_req: Request, res: Response) => {
  const videos = await prisma.video.findMany({ orderBy: { createdAt: "desc" } });
  res.json(videos);
});

// GET /api/videos/:video_id
// Returns a single video by its YouTube video ID.
app.get("/api/videos/:video_id", async (req: Request, res: Response) => {
  const video = await prisma.video.findUnique({
    where: { videoId: req.params.video_id },
  });
  if (!video) {
    res.status(404).json({ error: "Video not found" });
    return;
  }
  res.json(video);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
