from rest_framework import serializers
from .models import Author, Category, Genre, Mood, Tag, Book, Rating, Review
from apps.library.models import Favorite, Wishlist

class AuthorSerializer(serializers.ModelSerializer):
    books_count = serializers.IntegerField(source='books.count', read_only=True)

    class Meta:
        model = Author
        fields = ['id', 'name', 'biography', 'photo_url', 'nationality', 'books_count']

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'description']

class GenreSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)

    class Meta:
        model = Genre
        fields = ['id', 'name', 'slug', 'description', 'category', 'category_name']

class MoodSerializer(serializers.ModelSerializer):
    books_count = serializers.IntegerField(source='books.count', read_only=True)

    class Meta:
        model = Mood
        fields = ['id', 'name', 'slug', 'description', 'color_code', 'icon', 'books_count']

class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ['id', 'name', 'slug']

class ReviewSerializer(serializers.ModelSerializer):
    user_email = serializers.CharField(source='user.email', read_only=True)
    user_name = serializers.CharField(source='user.full_name', read_only=True)

    class Meta:
        model = Review
        fields = ['id', 'user', 'user_email', 'user_name', 'content', 'created_at']
        read_only_fields = ['user', 'created_at']

class RatingSerializer(serializers.ModelSerializer):
    user_email = serializers.CharField(source='user.email', read_only=True)

    class Meta:
        model = Rating
        fields = ['id', 'user', 'user_email', 'book', 'score', 'created_at']
        read_only_fields = ['user', 'created_at']

class BookListSerializer(serializers.ModelSerializer):
    authors = AuthorSerializer(many=True, read_only=True)
    genres = GenreSerializer(many=True, read_only=True)
    moods = MoodSerializer(many=True, read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    is_available = serializers.BooleanField(read_only=True)
    user_rating = serializers.SerializerMethodField()
    is_favorited = serializers.SerializerMethodField()
    is_wishlisted = serializers.SerializerMethodField()

    class Meta:
        model = Book
        fields = [
            'id', 'isbn', 'title', 'subtitle', 'cover_image_url',
            'publication_year', 'publisher', 'language', 'page_count',
            'authors', 'genres', 'moods', 'category_name',
            'total_copies', 'available_copies', 'is_available',
            'average_rating', 'ratings_count', 'is_active',
            'user_rating', 'is_favorited', 'is_wishlisted'
        ]

    def get_user_rating(self, obj):
        request = self.context.get('request')
        if request and request.user and request.user.is_authenticated:
            rating = obj.ratings.filter(user=request.user).first()
            return rating.score if rating else None
        return None

    def get_is_favorited(self, obj):
        request = self.context.get('request')
        if request and request.user and request.user.is_authenticated:
            return Favorite.objects.filter(user=request.user, book=obj).exists()
        return False

    def get_is_wishlisted(self, obj):
        request = self.context.get('request')
        if request and request.user and request.user.is_authenticated:
            return Wishlist.objects.filter(user=request.user, book=obj).exists()
        return False

class BookDetailSerializer(BookListSerializer):
    tags = TagSerializer(many=True, read_only=True)
    reviews = serializers.SerializerMethodField()

    class Meta(BookListSerializer.Meta):
        fields = BookListSerializer.Meta.fields + ['description', 'tags', 'reviews', 'created_at', 'updated_at']

    def get_reviews(self, obj):
        approved_reviews = obj.reviews.filter(is_approved=True)[:10]
        return ReviewSerializer(approved_reviews, many=True).data

class BookCreateUpdateSerializer(serializers.ModelSerializer):
    author_ids = serializers.PrimaryKeyRelatedField(many=True, queryset=Author.objects.all(), source='authors', required=False)
    genre_ids = serializers.PrimaryKeyRelatedField(many=True, queryset=Genre.objects.all(), source='genres', required=False)
    mood_ids = serializers.PrimaryKeyRelatedField(many=True, queryset=Mood.objects.all(), source='moods', required=False)
    tag_ids = serializers.PrimaryKeyRelatedField(many=True, queryset=Tag.objects.all(), source='tags', required=False)

    class Meta:
        model = Book
        fields = [
            'id', 'isbn', 'title', 'subtitle', 'description', 'cover_image_url',
            'publication_year', 'publisher', 'language', 'page_count',
            'category', 'author_ids', 'genre_ids', 'mood_ids', 'tag_ids',
            'total_copies', 'available_copies', 'is_active'
        ]
