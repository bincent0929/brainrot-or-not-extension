from datetime import datetime
from typing import Optional
from sqlmodel import SQLModel, Field


class Video_Score(SQLModel, table=True):
    video_id: str = Field(primary_key=True)
    transcript: str
    fetched_at: datetime = Field(default_factory=datetime.utcnow)
