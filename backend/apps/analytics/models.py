from django.db import models
from django.conf import settings
from django.utils import timezone
from apps.common.models import TimeStampedModel

class ReadingSession(TimeStampedModel):
    """
    Tracks precise reading / screen-time activity.
    Validated server-side to prevent client duration spoofing.
    """
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='reading_sessions')
    book = models.ForeignKey('books.Book', on_delete=models.SET_NULL, null=True, blank=True, related_name='reading_sessions')
    started_at = models.DateTimeField(default=timezone.now, db_index=True)
    ended_at = models.DateTimeField(null=True, blank=True, db_index=True)
    duration_seconds = models.PositiveIntegerField(default=0)
    pages_read = models.PositiveIntegerField(default=0)
    is_completed = models.BooleanField(default=False)
    source = models.CharField(max_length=50, default='WEB')

    class Meta:
        ordering = ['-started_at']
        indexes = [
            models.Index(fields=['user', 'started_at']),
        ]

    def close_session(self, reported_pages=0):
        if not self.ended_at:
            self.ended_at = timezone.now()
            calculated_duration = int((self.ended_at - self.started_at).total_seconds())
            # Cap maximum continuous session to 12 hours as sanity validation
            self.duration_seconds = max(0, min(calculated_duration, 43200))
        if reported_pages:
            self.pages_read = reported_pages
        self.is_completed = True
        self.save()

    def __str__(self):
        book_title = self.book.title if self.book else "General Reading"
        return f"Session: {self.user.email} on '{book_title}' ({self.duration_seconds}s)"

class SearchEvent(TimeStampedModel):
    """
    Logs search queries, mood clicks, and filter selections.
    Used for analytics and recommendation refinement.
    """
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='search_events')
    query = models.CharField(max_length=255, blank=True, default='')
    mood_slug = models.CharField(max_length=100, blank=True, default='')
    filters = models.JSONField(default=dict, blank=True)
    results_count = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        user_info = self.user.email if self.user else "Anonymous"
        return f"Search by {user_info}: '{self.query}' [Mood: {self.mood_slug}] -> {self.results_count} hits"

class UserStreak(TimeStampedModel):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='streak')
    current_streak = models.PositiveIntegerField(default=0)
    longest_streak = models.PositiveIntegerField(default=0)
    last_reading_date = models.DateField(null=True, blank=True)

    def record_activity(self, activity_date=None):
        if activity_date is None:
            activity_date = timezone.now().date()

        if self.last_reading_date is None:
            self.current_streak = 1
            self.longest_streak = max(self.longest_streak, 1)
            self.last_reading_date = activity_date
        elif self.last_reading_date == activity_date:
            # Already counted today
            pass
        elif self.last_reading_date == activity_date - timezone.timedelta(days=1):
            # Consecutive day
            self.current_streak += 1
            self.longest_streak = max(self.longest_streak, self.current_streak)
            self.last_reading_date = activity_date
        elif self.last_reading_date < activity_date - timezone.timedelta(days=1):
            # Streak broken
            self.current_streak = 1
            self.last_reading_date = activity_date

        self.save()

    def __str__(self):
        return f"{self.user.email} Streak: {self.current_streak} days (Max: {self.longest_streak})"
