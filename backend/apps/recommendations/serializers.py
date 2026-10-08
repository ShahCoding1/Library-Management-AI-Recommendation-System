from rest_framework import serializers
from apps.books.serializers import BookListSerializer
from .models import RecommendationLog, RecommendationEvent, NegativeSignal

class RecommendationItemSerializer(serializers.Serializer):
    book = serializers.SerializerMethodField()
    final_score = serializers.FloatField()
    reason = serializers.CharField()
    context = serializers.CharField(default='homepage')
    component_scores = serializers.DictField(required=False)

    def get_book(self, obj):
        request = self.context.get('request')
        return BookListSerializer(obj['book'], context={'request': request}).data

class RecommendationLogSerializer(serializers.ModelSerializer):
    book_title = serializers.CharField(source='book.title', read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)

    class Meta:
        model = RecommendationLog
        fields = [
            'id', 'user', 'user_email', 'book', 'book_title', 'context',
            'final_score', 'content_score', 'collaborative_score', 'mood_score',
            'preference_score', 'popularity_score', 'rating_score',
            'recency_score', 'availability_score', 'reason', 'model_version', 'created_at'
        ]

class RecommendationEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = RecommendationEvent
        fields = ['id', 'user', 'book', 'event_type', 'created_at']
        read_only_fields = ['user', 'created_at']

class NegativeSignalSerializer(serializers.ModelSerializer):
    class Meta:
        model = NegativeSignal
        fields = ['id', 'user', 'book', 'reason', 'created_at']
        read_only_fields = ['user', 'created_at']
