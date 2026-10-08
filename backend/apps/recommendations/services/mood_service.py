from apps.books.models import Book, Rating
from apps.library.models import Favorite

class MoodRecommendationService:
    """
    Dedicated Mood Matching and Affinity Scoring Service.
    Specification Sections 49-51.
    """
    @staticmethod
    def compute_mood_scores(user, candidate_books, explicit_mood_slugs=None):
        """
        Calculates normalized mood relevance scores [0.0 to 1.0] for candidate books.
        Considers both explicitly requested moods and the user's historical mood preferences.
        """
        explicit_slugs = set(explicit_mood_slugs or [])
        user_preferred_mood_ids = set()

        if user and user.is_authenticated:
            # Check explicit profile preferences
            if hasattr(user, 'preferences'):
                user_preferred_mood_ids.update(user.preferences.preferred_moods.values_list('id', flat=True))

            # Check implicit mood signals from 4+ star ratings and favorites
            high_rated_book_ids = list(Rating.objects.filter(user=user, score__gte=4).values_list('book_id', flat=True))
            fav_book_ids = list(Favorite.objects.filter(user=user).values_list('book_id', flat=True))
            interacted_ids = set(high_rated_book_ids + fav_book_ids)

            if interacted_ids:
                implicit_mood_ids = Book.objects.filter(id__in=interacted_ids).values_list('moods__id', flat=True)
                user_preferred_mood_ids.update([mid for mid in implicit_mood_ids if mid])

        scores = {}
        for book in candidate_books:
            book_moods = book.moods.all()
            if not book_moods:
                scores[book.id] = 0.0
                continue

            book_mood_slugs = {m.slug.lower() for m in book_moods}
            book_mood_ids = {m.id for m in book_moods}

            score = 0.0

            # Explicit mood query match (high priority bonus)
            if explicit_slugs:
                overlap = explicit_slugs.intersection(book_mood_slugs)
                score += (len(overlap) / len(explicit_slugs)) * 0.7

            # User preference alignment
            if user_preferred_mood_ids:
                pref_overlap = user_preferred_mood_ids.intersection(book_mood_ids)
                score += (len(pref_overlap) / max(1, len(user_preferred_mood_ids))) * 0.3

            scores[book.id] = min(1.0, score)

        return scores
