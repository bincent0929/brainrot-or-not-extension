from django.urls import path
from . import views

urlpatterns = [
    path("transcripts/", views.create_transcript, name="create-transcript"),
    path("videos/", views.list_videos, name="list-videos"),
    path("videos/<str:video_id>/", views.get_video, name="get-video"),
]
