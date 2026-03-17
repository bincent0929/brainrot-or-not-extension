from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, select
from youtube_transcript_api import YouTubeTranscriptApi, NoTranscriptFound, VideoUnavailable

from database import create_db, get_session, engine
from models import Video_Score


@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db()
    yield

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


def fetch_transcript(video_id: str) -> str:
    api = YouTubeTranscriptApi()
    fetched = api.fetch(video_id, languages=["en", "en-US"])
    
    """
    This grabs the text from the transcript that has the timestamps and puts it all
    together in a paragraph that an LLM can process.
    """
    segments = [entry["text"].replace("\n", " ") for entry in fetched.to_raw_data() if "text" in entry]
    return " ".join(segments)


@app.post("/transcript/{video_id}", response_model=Video_Score)
def get_or_create_transcript(video_id: str, session: Session = Depends(get_session)):
    existing = session.get(Video_Score, video_id)
    if existing:
        return existing

    try:
        text = fetch_transcript(video_id)
    except NoTranscriptFound:
        raise HTTPException(status_code=404, detail="No English transcript found for this video.")
    except VideoUnavailable:
        raise HTTPException(status_code=404, detail="Video unavailable.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    video_score = Video_Score(video_id=video_id, transcript=text)
    session.add(video_score)
    session.commit()
    session.refresh(video_score)
    return video_score

@app.get("/transcript/{video_id}", response_model=Video_Score)
def get_transcript(video_id: str, session: Session = Depends(get_session)):
    video_score = session.get(Video_Score, video_id)
    if not video_score:
        raise HTTPException(status_code=404, detail="Transcript not found.")
    return video_score

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8001, reload=True, log_level="debug")
