const videoId = process.argv[2];
if (!videoId) {
  console.error("Usage: npx tsx send-transcript.ts <video_id>");
  process.exit(1);
}

(async () => {
  const res = await fetch("http://localhost:8080/api/transcripts/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ video_id: videoId }),
  });

  const data = await res.json();
  console.log(JSON.stringify(data, null, 2));
})();
