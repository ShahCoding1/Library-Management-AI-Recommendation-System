from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import MeView, UserProfileView, UserPreferencesView, AdminUserViewSet

router = DefaultRouter()
router.register(r'admin/users', AdminUserViewSet, basename='admin-users')

urlpatterns = [
    path('me/', MeView.as_view(), name='user_me'),
    path('me/profile/', UserProfileView.as_view(), name='user_profile'),
    path('me/preferences/', UserPreferencesView.as_view(), name='user_preferences'),
    path('', include(router.urls)),
]
