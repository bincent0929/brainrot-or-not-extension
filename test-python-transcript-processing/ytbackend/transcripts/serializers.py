from rest_framework import serializers
from .models import Video

# this defines how the models are move from JSON to API responses and requests
class VideoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Video
        fields = [
            "id", "video_id", "title", "channel_name", "transcript", "created_at",
            "video_score", "scored_at", "model_used", "trained", "prompt_used",
        ]
        read_only_fields = ["id", "created_at", "transcript"]
