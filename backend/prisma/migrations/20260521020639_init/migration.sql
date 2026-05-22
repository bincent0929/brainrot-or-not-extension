-- CreateTable
CREATE TABLE "videos" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "video_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "channel_name" TEXT NOT NULL,
    "transcript" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "video_score" REAL,
    "score_reasoning" TEXT,
    "scored_at" DATETIME,
    "model_used" TEXT,
    "trained" BOOLEAN,
    "prompt_used" TEXT
);

-- CreateIndex
CREATE UNIQUE INDEX "videos_video_id_key" ON "videos"("video_id");
