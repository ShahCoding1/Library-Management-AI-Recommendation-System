from django.db import models
from django.conf import settings
from apps.common.models import TimeStampedModel

class RecommendationLog(TimeStampedModel):
    """
    Persists recommendation generation records with transparent score breakdown.
    Crucial for FYP evaluation, explainability, viva demonstration, and CTR tracking.
    """
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='recommendation_logs')
    book = models.ForeignKey('books.Book', on_delete=models.CASCADE, related_name='recommendation_logs')
    context = models.CharField(max_length=50, default='homepage')
    
    # Normalized component scores (0.0 to 1.0)
    final_score = models.FloatField(default=0.0)
    content_score = models.FloatField(default=0.0)
    collaborative_score = models.FloatField(default=0.0)
    mood_score = models.FloatField(default=0.0)
    preference_score = models.FloatField(default=0.0)
    popularity_score = models.FloatField(default=0.0)
    rating_score = models.FloatField(default=0.0)
    recency_score = models.FloatField(default=0.0)
    availability_score = models.FloatField(default=0.0)
    
    reason = models.CharField(max_length=255, blank=True)
    model_version = models.CharField(max_length=50, default='v1.0-hybrid')

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Rec to {self.user.email} -> {self.book.title} (Score: {self.final_score:.2f})"

class RecommendationEvent(TimeStampedModel):
    """
    Tracks user engagement with recommendations for precision/recall and CTR tracking.
    """
    class EventType(models.TextChoices):
        IMPRESSION = 'IMPRESSION', 'Impression / Viewed'
        CLICK = 'CLICK', 'Clicked'
        BORROW = 'BORROW', 'Borrowed'
        FAVORITE = 'FAVORITE', 'Favorited'
        WISHLIST = 'WISHLIST', 'Added to Wishlist'
        NOT_INTERESTED = 'NOT_INTERESTED', 'Not Interested / Hidden'

    recommendation_log = models.ForeignKey(RecommendationLog, on_delete=models.SET_NULL, null=True, blank=True, related_name='events')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='recommendation_events')
    book = models.ForeignKey('books.Book', on_delete=models.CASCADE, related_name='recommendation_events')
    event_type = models.CharField(max_length=30, choices=EventType.choices, default=EventType.IMPRESSION, db_index=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.email} - {self.event_type} on {self.book.title}"

class NegativeSignal(TimeStampedModel):
    """
    Stores explicit negative feedback (Section 45 & 82) so books or genres
    marked 'Not Interested' are down-weighted or filtered.
    """
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='negative_signals')
    book = models.ForeignKey('books.Book', on_delete=models.CASCADE, related_name='negative_signals')
    reason = models.CharField(max_length=100, default='not_interested')

    class Meta:
        unique_together = ('user', 'book')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.email} disliked/hidden {self.book.title}"
