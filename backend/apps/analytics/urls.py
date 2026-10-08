from django.urls import path
from .views import (
    StartReadingSessionView, HeartbeatReadingSessionView, EndReadingSessionView,
    ActiveReadingSessionView, UserReadingAnalyticsView, AdminSystemAnalyticsView
)

urlpatterns = [
    path('reading-sessions/start/', StartReadingSessionView.as_view(), name='start_reading_session'),
    path('reading-sessions/<int:session_id>/heartbeat/', HeartbeatReadingSessionView.as_view(), name='heartbeat_reading_session'),
    path('reading-sessions/<int:session_id>/end/', EndReadingSessionView.as_view(), name='end_reading_session'),
    path('reading-sessions/active/', ActiveReadingSessionView.as_view(), name='active_reading_session'),
    path('user/', UserReadingAnalyticsView.as_view(), name='user_reading_analytics'),
    path('admin/', AdminSystemAnalyticsView.as_view(), name='admin_system_analytics'),
]
