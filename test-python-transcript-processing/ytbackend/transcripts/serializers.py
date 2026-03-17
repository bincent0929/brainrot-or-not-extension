from rest_framework import serializers
from .models import Video


class VideoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Video
        fields = ["id", "video_id", "title", "channel_name", "transcript", "created_at"]
        read_only_fields = fields
