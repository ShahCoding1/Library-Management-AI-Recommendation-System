from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    BookViewSet, AuthorViewSet, GenreViewSet, MoodViewSet,
    CategoryViewSet, TagViewSet, RateBookView, ReviewListCreateView
)

router = DefaultRouter()
router.register(r'authors', AuthorViewSet, basename='author')
router.register(r'categories', CategoryViewSet, basename='category')
router.register(r'genres', GenreViewSet, basename='genre')
router.register(r'moods', MoodViewSet, basename='mood')
router.register(r'tags', TagViewSet, basename='tag')
router.register(r'', BookViewSet, basename='book')

urlpatterns = [
    path('<int:book_id>/rate/', RateBookView.as_view(), name='book_rate'),
    path('<int:book_id>/reviews/', ReviewListCreateView.as_view(), name='book_reviews'),
    path('', include(router.urls)),
]
