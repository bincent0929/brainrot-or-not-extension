import yt_dlp
from youtube_transcript_api import YouTubeTranscriptApi


def fetch_video_metadata(video_id: str) -> dict:
    """Use yt-dlp to grab the video title and channel name."""
    ydl_opts = {
        "quiet": True,
        "no_warnings": True,
        "skip_download": True,
    }
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(
            f"https://www.youtube.com/watch?v={video_id}",
            download=False,
        )
    return {
        "title": info.get("title", "Unknown"),
        "channel_name": info.get("uploader", "Unknown"),
    }


def fetch_transcript(video_id: str) -> str:
    """Fetch the transcript and return it as a single joined string."""
    ytt_api = YouTubeTranscriptApi()
    fetched = ytt_api.fetch(video_id, languages=["en", "en-US"])
    segments = [
        entry["text"].replace("\n", " ")
        for entry in fetched.to_raw_data()
        if "text" in entry
    ]
    return " ".join(segments)
