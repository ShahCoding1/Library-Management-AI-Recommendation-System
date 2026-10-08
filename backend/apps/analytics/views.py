from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from django.utils import timezone
from apps.common.permissions import IsLibrarianOrAdmin
from apps.books.models import Book
from .models import ReadingSession, UserStreak
from .services import ScreenTimeAnalyticsService
from .serializers import ReadingSessionSerializer

class StartReadingSessionView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        book_id = request.data.get('book_id')
        source = request.data.get('source', 'WEB')

        # Close any lingering unfinished sessions
        lingering = ReadingSession.objects.filter(user=request.user, is_completed=False)
        for s in lingering:
            s.close_session()

        book = None
        if book_id:
            try:
                book = Book.objects.get(pk=book_id)
            except Book.DoesNotExist:
                pass

        session = ReadingSession.objects.create(
            user=request.user,
            book=book,
            started_at=timezone.now(),
            source=source,
            is_completed=False
        )
        serializer = ReadingSessionSerializer(session)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class HeartbeatReadingSessionView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, session_id):
        try:
            session = ReadingSession.objects.get(pk=session_id, user=request.user, is_completed=False)
        except ReadingSession.DoesNotExist:
            return Response({'error': {'code': 'NOT_FOUND', 'message': 'Active session not found'}}, status=status.HTTP_404_NOT_FOUND)

        now = timezone.now()
        duration = int((now - session.started_at).total_seconds())
        session.duration_seconds = max(0, min(duration, 43200))
        session.save(update_fields=['duration_seconds', 'updated_at'])

        return Response({
            'session_id': session.id,
            'duration_seconds': session.duration_seconds,
            'status': 'alive'
        })

class EndReadingSessionView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, session_id):
        try:
            session = ReadingSession.objects.get(pk=session_id, user=request.user, is_completed=False)
        except ReadingSession.DoesNotExist:
            return Response({'error': {'code': 'NOT_FOUND', 'message': 'Active session not found'}}, status=status.HTTP_404_NOT_FOUND)

        pages_read = int(request.data.get('pages_read', 0))
        session.close_session(reported_pages=pages_read)

        # Update streak
        streak, _ = UserStreak.objects.get_or_create(user=request.user)
        streak.record_activity()

        serializer = ReadingSessionSerializer(session)
        return Response({
            'message': f"Reading session recorded ({ScreenTimeAnalyticsService._format_duration(session.duration_seconds)}).",
            'session': serializer.data,
            'current_streak': streak.current_streak
        }, status=status.HTTP_200_OK)

class ActiveReadingSessionView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        active_session = ReadingSession.objects.filter(
            user=request.user, is_completed=False
        ).select_related('book').first()

        if not active_session:
            return Response({'active_session': None})

        # Calculate current live duration
        live_duration = int((timezone.now() - active_session.started_at).total_seconds())
        active_session.duration_seconds = max(0, live_duration)

        serializer = ReadingSessionSerializer(active_session)
        return Response({'active_session': serializer.data})

class UserReadingAnalyticsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        analytics_data = ScreenTimeAnalyticsService.get_user_analytics(request.user)
        return Response(analytics_data)

class AdminSystemAnalyticsView(APIView):
    permission_classes = [IsLibrarianOrAdmin]

    def get(self, request):
        admin_data = ScreenTimeAnalyticsService.get_admin_analytics()
        return Response(admin_data)
