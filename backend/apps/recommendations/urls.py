from django.urls import path
from .views import (
    RecommendationListView, UserRecommendationsView, MoodRecommendationsView,
    RecordRecommendationEventView, AdminRecommendationMonitoringView,
    AdminRecommendationDebugView, AdminRebuildRecommendationModelView
)

urlpatterns = [
    path('', RecommendationListView.as_view(), name='recommendation_list'),
    path('me/', UserRecommendationsView.as_view(), name='user_recommendations'),
    path('mood/<slug:slug>/', MoodRecommendationsView.as_view(), name='mood_recommendations'),
    path('events/', RecordRecommendationEventView.as_view(), name='record_recommendation_event'),
    path('admin/stats/', AdminRecommendationMonitoringView.as_view(), name='admin_recommendation_stats'),
    path('admin/debug/', AdminRecommendationDebugView.as_view(), name='admin_recommendation_debug'),
    path('admin/rebuild/', AdminRebuildRecommendationModelView.as_view(), name='admin_recommendation_rebuild'),
]

