from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from django.db.models import Count
from apps.common.permissions import IsAdminRole
from apps.books.models import Book
from .models import RecommendationLog, RecommendationEvent, NegativeSignal
from .services.hybrid_service import HybridRecommendationService
from .serializers import (
    RecommendationItemSerializer, RecommendationLogSerializer,
    RecommendationEventSerializer
)

class RecommendationListView(APIView):
    """
    General / Homepage recommendation endpoint.
    GET /api/v1/recommendations/?context=homepage&mood=romantic&limit=10
    """
    def get(self, request):
        context = request.query_params.get('context', 'homepage')
        mood = request.query_params.get('mood')
        mood_slugs = [mood] if mood else None
        limit = int(request.query_params.get('limit', 10))

        service = HybridRecommendationService()
        recs = service.get_recommendations(
            user=request.user if request.user.is_authenticated else None,
            context=context,
            mood_slugs=mood_slugs,
            top_k=limit
        )

        serializer = RecommendationItemSerializer(recs, many=True, context={'request': request})
        return Response({'results': serializer.data, 'count': len(recs), 'context': context})

class UserRecommendationsView(APIView):
    """
    Personalized recommendations for authenticated user.
    GET /api/v1/users/me/recommendations/
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        context = request.query_params.get('context', 'user_dashboard')
        limit = int(request.query_params.get('limit', 10))

        service = HybridRecommendationService()
        recs = service.get_recommendations(
            user=request.user,
            context=context,
            top_k=limit
        )
        serializer = RecommendationItemSerializer(recs, many=True, context={'request': request})
        return Response({'results': serializer.data, 'count': len(recs)})

class MoodRecommendationsView(APIView):
    """
    Mood discovery recommendations.
    GET /api/v1/recommendations/mood/<slug>/
    """
    def get(self, request, slug):
        limit = int(request.query_params.get('limit', 12))
        service = HybridRecommendationService()
        recs = service.get_recommendations(
            user=request.user if request.user.is_authenticated else None,
            context=f'mood_{slug}',
            mood_slugs=[slug],
            top_k=limit
        )
        serializer = RecommendationItemSerializer(recs, many=True, context={'request': request})
        return Response({'mood': slug, 'results': serializer.data, 'count': len(recs)})

class RecordRecommendationEventView(APIView):
    """
    Tracks CTR and engagement events: impression, click, not_interested.
    POST /api/v1/recommendations/events/
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        book_id = request.data.get('book_id')
        event_type = request.data.get('event_type', RecommendationEvent.EventType.CLICK)
        if not book_id:
            return Response({'error': {'code': 'MISSING_BOOK_ID', 'message': 'book_id is required'}}, status=status.HTTP_400_BAD_REQUEST)

        try:
            book = Book.objects.get(pk=book_id)
        except Book.DoesNotExist:
            return Response({'error': {'code': 'NOT_FOUND', 'message': 'Book not found'}}, status=status.HTTP_404_NOT_FOUND)

        if event_type == RecommendationEvent.EventType.NOT_INTERESTED:
            NegativeSignal.objects.update_or_create(
                user=request.user,
                book=book,
                defaults={'reason': 'not_interested'}
            )

        event = RecommendationEvent.objects.create(
            user=request.user,
            book=book,
            event_type=event_type
        )
        return Response({'status': 'recorded', 'event_id': event.id}, status=status.HTTP_201_CREATED)

class AdminRecommendationMonitoringView(APIView):
    """
    Admin dashboard metrics for recommendation health & CTR (Section 75 & 198).
    """
    permission_classes = [IsAdminRole]

    def get(self, request):
        total_logs = RecommendationLog.objects.count()
        total_clicks = RecommendationEvent.objects.filter(event_type=RecommendationEvent.EventType.CLICK).count()
        total_borrows = RecommendationEvent.objects.filter(event_type=RecommendationEvent.EventType.BORROW).count()
        total_impressions = RecommendationEvent.objects.filter(event_type=RecommendationEvent.EventType.IMPRESSION).count() or 1

        ctr = round((total_clicks / total_impressions) * 100, 2)

        recent_logs = RecommendationLog.objects.select_related('user', 'book').order_by('-created_at')[:20]
        logs_serializer = RecommendationLogSerializer(recent_logs, many=True)

        return Response({
            'total_recommendations_generated': total_logs,
            'total_impressions': total_impressions,
            'total_clicks': total_clicks,
            'total_borrows': total_borrows,
            'ctr_percentage': ctr,
            'recent_logs': logs_serializer.data
        })

class AdminRecommendationDebugView(APIView):
    """
    Viva / Defense score breakdown inspector (Section 78 & 159).
    Exposes raw component scores for any book candidate.
    """
    permission_classes = [IsAdminRole]

    def get(self, request):
        book_id = request.query_params.get('book_id')
        user_id = request.query_params.get('user_id')

        from django.contrib.auth import get_user_model
        User = get_user_model()
        target_user = User.objects.filter(id=user_id).first() if user_id else request.user

        service = HybridRecommendationService()
        recs = service.get_recommendations(user=target_user, top_k=20, log_events=False)

        if book_id:
            recs = [r for r in recs if r['book'].id == int(book_id)]

        results = []
        for r in recs:
            results.append({
                'book_id': r['book'].id,
                'book_title': r['book'].title,
                'final_score': round(r['final_score'], 3),
                'component_scores': {k: round(v, 3) for k, v in r['component_scores'].items()},
                'reason': r['reason']
            })

        return Response({'user_email': target_user.email, 'debug_results': results})

class AdminRebuildRecommendationModelView(APIView):
    """
    Triggers re-computation of TF-IDF feature matrices and model serialization.
    """
    permission_classes = [IsAdminRole]

    def post(self, request):
        from .services.content_based import ContentBasedRecommender
        recommender = ContentBasedRecommender()
        success = recommender.build_model()
        if success:
            return Response({'status': 'success', 'message': 'Recommendation model TF-IDF feature matrix rebuilt successfully.'})
        return Response({'status': 'error', 'message': 'Failed to rebuild recommendation model.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


