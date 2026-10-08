from django.db.models import Q, Case, When, Value, IntegerField
from apps.books.models import Book, Author, Genre, Mood, Tag
from apps.analytics.models import SearchEvent

class SearchService:
    @staticmethod
    def execute_search(params, user=None):
        """
        Executes multi-criteria and mood-based advanced search.
        Considers title, author, mood, genre, rating, and availability.
        Calculates search relevance scoring (Section 169).
        """
        query = params.get('q', '').strip()
        mood_slugs = [m.strip() for m in params.get('moods', '').split(',') if m.strip()]
        if not mood_slugs and params.get('mood'):
            mood_slugs = [params.get('mood').strip()]

        genre_slugs = [g.strip() for g in params.get('genres', '').split(',') if g.strip()]
        if not genre_slugs and params.get('genre'):
            genre_slugs = [params.get('genre').strip()]

        author_id = params.get('author')
        category_slug = params.get('category')
        min_rating = params.get('min_rating')
        year_min = params.get('year_min')
        year_max = params.get('year_max')
        available_only = params.get('available') in ('true', '1')
        ordering = params.get('ordering', 'relevance')

        qs = Book.objects.filter(is_active=True).prefetch_related(
            'authors', 'genres', 'moods', 'tags', 'ratings', 'reviews'
        ).select_related('category')

        # Text query filtering
        if query:
            qs = qs.filter(
                Q(title__icontains=query) |
                Q(subtitle__icontains=query) |
                Q(authors__name__icontains=query) |
                Q(genres__name__icontains=query) |
                Q(moods__name__icontains=query) |
                Q(tags__name__icontains=query) |
                Q(description__icontains=query) |
                Q(isbn__iexact=query)
            ).distinct()

        # Dedicated Mood Filter (Multiple moods prioritized, Section 25 & 143)
        if mood_slugs:
            for m_slug in mood_slugs:
                qs = qs.filter(moods__slug__iexact=m_slug)

        # Genre Filter
        if genre_slugs:
            for g_slug in genre_slugs:
                qs = qs.filter(genres__slug__iexact=g_slug)

        # Author Filter
        if author_id:
            qs = qs.filter(authors__id=author_id)

        # Category Filter
        if category_slug:
            qs = qs.filter(category__slug=category_slug)

        # Min Rating Filter
        if min_rating:
            try:
                qs = qs.filter(average_rating__gte=float(min_rating))
            except ValueError:
                pass

        # Year Range
        if year_min:
            try:
                qs = qs.filter(publication_year__gte=int(year_min))
            except ValueError:
                pass
        if year_max:
            try:
                qs = qs.filter(publication_year__lte=int(year_max))
            except ValueError:
                pass

        # Availability
        if available_only:
            qs = qs.filter(available_copies__gt=0)

        # Relevance scoring when text query is present
        if query and ordering == 'relevance':
            qs = qs.annotate(
                relevance_score=Case(
                    When(title__iexact=query, then=Value(100)),
                    When(title__istartswith=query, then=Value(80)),
                    When(title__icontains=query, then=Value(60)),
                    When(authors__name__icontains=query, then=Value(40)),
                    When(moods__name__icontains=query, then=Value(30)),
                    When(genres__name__icontains=query, then=Value(20)),
                    default=Value(10),
                    output_field=IntegerField()
                )
            ).order_by('-relevance_score', '-average_rating', '-created_at')
        elif ordering == 'newest':
            qs = qs.order_by('-created_at')
        elif ordering == 'oldest':
            qs = qs.order_by('created_at')
        elif ordering == 'rating':
            qs = qs.order_by('-average_rating', '-ratings_count')
        elif ordering == 'title':
            qs = qs.order_by('title')
        elif ordering == 'available':
            qs = qs.order_by('-available_copies')
        else:
            qs = qs.order_by('-average_rating', '-created_at')

        # Log Search Event for Analytics
        try:
            SearchEvent.objects.create(
                user=user if (user and user.is_authenticated) else None,
                query=query,
                mood_slug=",".join(mood_slugs),
                filters={
                    'genres': genre_slugs,
                    'author': author_id,
                    'min_rating': min_rating,
                    'available_only': available_only
                },
                results_count=qs.count()
            )
        except Exception:
            pass

        return qs

    @staticmethod
    def get_autocomplete_suggestions(query, limit=8):
        """
        Fast autocomplete suggestions for titles, authors, genres, and moods.
        """
        if not query or len(query.strip()) < 2:
            return {'titles': [], 'authors': [], 'moods': [], 'genres': []}

        q = query.strip()
        books = Book.objects.filter(is_active=True, title__icontains=q).values('id', 'title')[:limit]
        authors = Author.objects.filter(name__icontains=q).values('id', 'name')[:limit]
        moods = Mood.objects.filter(name__icontains=q).values('id', 'name', 'slug', 'color_code')[:limit]
        genres = Genre.objects.filter(name__icontains=q).values('id', 'name', 'slug')[:limit]

        return {
            'books': list(books),
            'authors': list(authors),
            'moods': list(moods),
            'genres': list(genres)
        }
