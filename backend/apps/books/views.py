from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Q
from apps.common.permissions import IsLibrarianOrAdmin, IsReaderOrReadOnly
from .models import Author, Category, Genre, Mood, Tag, Book, Rating, Review
from .serializers import (
    AuthorSerializer, CategorySerializer, GenreSerializer, MoodSerializer,
    TagSerializer, BookListSerializer, BookDetailSerializer, BookCreateUpdateSerializer,
    RatingSerializer, ReviewSerializer
)

class AuthorViewSet(viewsets.ModelViewSet):
    queryset = Author.objects.all().prefetch_related('books')
    serializer_class = AuthorSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'biography']
    ordering_fields = ['name', 'created_at']

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsLibrarianOrAdmin()]
        return [permissions.AllowAny()]

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsLibrarianOrAdmin()]
        return [permissions.AllowAny()]

class GenreViewSet(viewsets.ModelViewSet):
    queryset = Genre.objects.all().select_related('category')
    serializer_class = GenreSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'slug']
    ordering_fields = ['name']

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsLibrarianOrAdmin()]
        return [permissions.AllowAny()]

class MoodViewSet(viewsets.ModelViewSet):
    queryset = Mood.objects.all().prefetch_related('books')
    serializer_class = MoodSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'slug', 'description']
    ordering_fields = ['name']

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsLibrarianOrAdmin()]
        return [permissions.AllowAny()]

class TagViewSet(viewsets.ModelViewSet):
    queryset = Tag.objects.all()
    serializer_class = TagSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsLibrarianOrAdmin()]
        return [permissions.AllowAny()]

class BookViewSet(viewsets.ModelViewSet):
    queryset = Book.objects.filter(is_active=True).prefetch_related(
        'authors', 'genres', 'moods', 'tags', 'ratings', 'reviews'
    ).select_related('category')
    
    def get_queryset(self):
        qs = Book.objects.all().prefetch_related(
            'authors', 'genres', 'moods', 'tags', 'ratings', 'reviews'
        ).select_related('category')

        # Allow admins to see inactive books, public users see only active
        user = self.request.user
        if not (user and user.is_authenticated and (user.is_superuser or user.role in ['ADMIN', 'LIBRARIAN'])):
            qs = qs.filter(is_active=True)

        # Filters
        genre_slug = self.request.query_params.get('genre')
        if genre_slug:
            qs = qs.filter(genres__slug=genre_slug)

        mood_slug = self.request.query_params.get('mood')
        if mood_slug:
            qs = qs.filter(moods__slug=mood_slug)

        author_id = self.request.query_params.get('author')
        if author_id:
            qs = qs.filter(authors__id=author_id)

        available_only = self.request.query_params.get('available')
        if available_only in ('true', '1'):
            qs = qs.filter(available_copies__gt=0)

        min_rating = self.request.query_params.get('min_rating')
        if min_rating:
            try:
                qs = qs.filter(average_rating__gte=float(min_rating))
            except ValueError:
                pass

        search = self.request.query_params.get('search')
        if search:
            qs = qs.filter(
                Q(title__icontains=search) |
                Q(subtitle__icontains=search) |
                Q(authors__name__icontains=search) |
                Q(genres__name__icontains=search) |
                Q(moods__name__icontains=search) |
                Q(tags__name__icontains=search) |
                Q(isbn__icontains=search)
            ).distinct()

        # Sorting
        ordering = self.request.query_params.get('ordering', '-created_at')
        valid_orderings = [
            'created_at', '-created_at', 'title', '-title',
            'average_rating', '-average_rating', 'publication_year',
            '-publication_year', 'available_copies', '-available_copies'
        ]
        if ordering in valid_orderings:
            qs = qs.order_by(ordering)
        else:
            qs = qs.order_by('-created_at')

        return qs

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return BookCreateUpdateSerializer
        if self.action == 'retrieve':
            return BookDetailSerializer
        return BookListSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsLibrarianOrAdmin()]
        return [permissions.AllowAny()]

    @action(detail=True, methods=['get'])
    def similar(self, request, pk=None):
        """
        Content-based similar books endpoint (Section 42 & 144)
        """
        book = self.get_object()
        from apps.recommendations.services.content_based import ContentBasedRecommender
        recommender = ContentBasedRecommender()
        similar_books = recommender.get_similar_books(book_id=book.id, top_k=6)
        serializer = BookListSerializer(similar_books, many=True, context={'request': request})
        return Response(serializer.data)

class RateBookView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, book_id):
        try:
            book = Book.objects.get(pk=book_id)
        except Book.DoesNotExist:
            return Response({'error': {'code': 'NOT_FOUND', 'message': 'Book not found'}}, status=status.HTTP_404_NOT_FOUND)

        score = request.data.get('score')
        if not score or not isinstance(score, int) or score < 1 or score > 5:
            return Response(
                {'error': {'code': 'INVALID_SCORE', 'message': 'Rating score must be an integer between 1 and 5'}},
                status=status.HTTP_400_BAD_REQUEST
            )

        rating, created = Rating.objects.update_or_create(
            user=request.user,
            book=book,
            defaults={'score': score}
        )

        return Response({
            'message': 'Rating saved successfully',
            'score': rating.score,
            'book_average_rating': book.average_rating,
            'book_ratings_count': book.ratings_count
        }, status=status.HTTP_200_OK)

class ReviewListCreateView(APIView):
    def get_permissions(self):
        if self.request.method == 'POST':
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def get(self, request, book_id):
        reviews = Review.objects.filter(book_id=book_id, is_approved=True)
        serializer = ReviewSerializer(reviews, many=True)
        return Response(serializer.data)

    def post(self, request, book_id):
        try:
            book = Book.objects.get(pk=book_id)
        except Book.DoesNotExist:
            return Response({'error': {'code': 'NOT_FOUND', 'message': 'Book not found'}}, status=status.HTTP_404_NOT_FOUND)

        content = request.data.get('content', '').strip()
        if not content:
            return Response({'error': {'code': 'EMPTY_REVIEW', 'message': 'Review content cannot be empty'}}, status=status.HTTP_400_BAD_REQUEST)

        review = Review.objects.create(
            user=request.user,
            book=book,
            content=content,
            is_approved=True
        )
        serializer = ReviewSerializer(review)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
