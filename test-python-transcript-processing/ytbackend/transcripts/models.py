from django.db import models


class Video(models.Model):
    video_id = models.CharField(max_length=20, unique=True)
    title = models.CharField(max_length=500)
    channel_name = models.CharField(max_length=300)
    transcript = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    video_score = models.FloatField(null=True, blank=True)
    score_reasoning = models.TextField(null=True, blank=True)
    scored_at = models.DateTimeField(null=True, blank=True)
    model_used = models.CharField(null=True, blank=True, max_length=100)
    # whether it's a model trained for the case
    trained = models.BooleanField(null=True, blank=True)
    prompt_used = models.TextField(null=True, blank=True)
    
    # sets queries to sort from newest to oldest by default
    class Meta:
        ordering = ["-created_at"]

    # defines how an instance is displayed as a string
    # for the django admin shell etc.
    def __str__(self):
        return f"{self.title} ({self.video_id})"
