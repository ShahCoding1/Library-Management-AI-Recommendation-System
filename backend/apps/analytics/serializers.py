from rest_framework import serializers
from .models import ReadingSession, SearchEvent, UserStreak
from apps.books.serializers import BookListSerializer

class ReadingSessionSerializer(serializers.ModelSerializer):
    book = BookListSerializer(read_only=True)
    book_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)

    class Meta:
        model = ReadingSession
        fields = [
            'id', 'user', 'book', 'book_id', 'started_at', 'ended_at',
            'duration_seconds', 'pages_read', 'is_completed', 'source'
        ]
        read_only_fields = ['user', 'started_at', 'ended_at', 'duration_seconds', 'is_completed']

class UserStreakSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserStreak
        fields = ['current_streak', 'longest_streak', 'last_reading_date']

class SearchEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = SearchEvent
        fields = ['id', 'user', 'query', 'mood_slug', 'filters', 'results_count', 'created_at']
