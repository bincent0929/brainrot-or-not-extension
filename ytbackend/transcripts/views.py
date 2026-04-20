from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .models import Video
from .serializers import VideoSerializer
from .services import fetch_video_metadata, fetch_transcript


@api_view(["POST"])
def create_transcript(request):
    """
    Accepts { "video_id": "abc123" }
    - If the video is already saved, returns the existing record.
    - Otherwise fetches metadata + transcript, saves, and returns it.
    """
    video_id = request.data.get("video_id", "").strip()
    if not video_id:
        return Response(
            {"error": "video_id is required"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # Return existing record if we already have it
    existing = Video.objects.filter(video_id=video_id).first()
    if existing:
        return Response(VideoSerializer(existing).data)

    try:
        metadata = fetch_video_metadata(video_id)
        transcript = fetch_transcript(video_id)
    except Exception as exc:
        return Response(
            {"error": str(exc)},
            status=status.HTTP_502_BAD_GATEWAY,
        )

    video = Video.objects.create(
        video_id=video_id,
        title=metadata["title"],
        channel_name=metadata["channel_name"],
        transcript=transcript,
    )
    return Response(
        VideoSerializer(video).data,
        status=status.HTTP_201_CREATED,
    )


@api_view(["GET"])
def list_videos(request):
    """Return every saved video (newest first)."""
    videos = Video.objects.all()
    return Response(VideoSerializer(videos, many=True).data)


@api_view(["GET"])
def get_video(request, video_id):
    """Look up a single video by its YouTube video_id."""
    video = Video.objects.filter(video_id=video_id).first()
    if not video:
        return Response(
            {"error": "Video not found"},
            status=status.HTTP_404_NOT_FOUND,
        )
    return Response(VideoSerializer(video).data)
