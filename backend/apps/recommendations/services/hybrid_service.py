from django.conf import settings
from django.db.models import Count
from apps.books.models import Book, Rating
from apps.library.models import Loan, Favorite, Wishlist
from apps.recommendations.models import RecommendationLog, NegativeSignal
from .content_based import ContentBasedRecommender
from .collaborative import CollaborativeRecommender
from .mood_service import MoodRecommendationService
from .explanation_service import RecommendationExplanationService

class HybridRecommendationService:
    """
    Master Hybrid Recommendation Engine combining:
    1. Content-Based Filtering (TF-IDF & Cosine Similarity)
    2. Item-Based Collaborative Filtering
    3. Dedicated Mood Affinity Matching
    4. Explicit Profile Preferences
    5. Popularity Signal
    6. Rating Quality Signal
    7. Recency Signal
    8. Inventory Availability Signal
    9. Diversification & Cold-Start Fallback
    """
    def __init__(self):
        cfg = settings.RECOMMENDATION_CONFIG
        self.w_content = cfg.get('CONTENT_WEIGHT', 0.25)
        self.w_collab = cfg.get('COLLABORATIVE_WEIGHT', 0.20)
        self.w_mood = cfg.get('MOOD_WEIGHT', 0.20)
        self.w_pref = cfg.get('PREFERENCE_WEIGHT', 0.15)
        self.w_pop = cfg.get('POPULARITY_WEIGHT', 0.08)
        self.w_rating = cfg.get('RATING_WEIGHT', 0.07)
        self.w_recency = cfg.get('RECENCY_WEIGHT', 0.03)
        self.w_avail = cfg.get('AVAILABILITY_WEIGHT', 0.02)
        self.top_k = cfg.get('TOP_K', 10)

        self.content_recommender = ContentBasedRecommender()
        self.collab_recommender = CollaborativeRecommender()

    def get_recommendations(self, user=None, context="homepage", mood_slugs=None, top_k=None, log_events=True):
        if top_k is None:
            top_k = self.top_k

        # 1. Fetch Candidate Books (Active books)
        candidate_books = list(Book.objects.filter(is_active=True).prefetch_related(
            'authors', 'genres', 'moods', 'tags'
        ).select_related('category'))

        if not candidate_books:
            return []

        # 2. Exclude Consumed and Disliked Books for Authenticated Users (Section 60 & 82)
        excluded_book_ids = set()
        if user and user.is_authenticated:
            loans = Loan.objects.filter(user=user).values_list('book_id', flat=True)
            negatives = NegativeSignal.objects.filter(user=user).values_list('book_id', flat=True)
            excluded_book_ids.update(loans)
            excluded_book_ids.update(negatives)

        candidates = [b for b in candidate_books if b.id not in excluded_book_ids]
        if not candidates:
            # Fallback if user consumed all or high exclusions
            candidates = candidate_books

        # 3. Calculate Component Scores
        # Content Scores
        content_scores = self.content_recommender.compute_user_content_scores(user) if user and user.is_authenticated else {}

        # Collaborative Scores
        collab_scores = self.collab_recommender.compute_user_collaborative_scores(user) if user and user.is_authenticated else {}

        # Mood Scores
        mood_scores = MoodRecommendationService.compute_mood_scores(user, candidates, explicit_mood_slugs=mood_slugs)

        # Explicit Preference Scores
        pref_scores = self._compute_preference_scores(user, candidates)

        # Popularity Scores
        pop_scores = self._compute_popularity_scores(candidates)

        # Rating Scores
        rating_scores = {b.id: min(1.0, b.average_rating / 5.0) for b in candidates}

        # Recency Scores (newer books get modest boost)
        recency_scores = self._compute_recency_scores(candidates)

        # Availability Scores
        avail_scores = {b.id: (1.0 if b.available_copies > 0 else 0.2) for b in candidates}

        # Adjust weights dynamically if collaborative filtering or content has cold start
        has_content = bool(content_scores)
        has_collab = bool(collab_scores)

        wc = self.w_content if has_content else 0.0
        wcl = self.w_collab if has_collab else 0.0
        wm = self.w_mood
        wp = self.w_pref
        wpop = self.w_pop if (has_content or has_collab) else 0.35
        wr = self.w_rating
        wrec = self.w_recency
        wa = self.w_avail

        total_weight = wc + wcl + wm + wp + wpop + wr + wrec + wa
        if total_weight <= 0:
            total_weight = 1.0

        # 4. Compute Final Hybrid Score for each candidate
        scored_candidates = []
        for book in candidates:
            bid = book.id
            sc = content_scores.get(bid, 0.0)
            scl = collab_scores.get(bid, 0.0)
            sm = mood_scores.get(bid, 0.0)
            sp = pref_scores.get(bid, 0.0)
            spop = pop_scores.get(bid, 0.0)
            sr = rating_scores.get(bid, 0.0)
            srec = recency_scores.get(bid, 0.0)
            sa = avail_scores.get(bid, 0.0)

            final_score = (
                wc * sc +
                wcl * scl +
                wm * sm +
                wp * sp +
                wpop * spop +
                wr * sr +
                wrec * srec +
                wa * sa
            ) / total_weight

            component_scores = {
                'content': sc,
                'collab': scl,
                'mood': sm,
                'pref': sp,
                'pop': spop,
                'rating': sr,
                'recency': srec,
                'availability': sa,
            }

            scored_candidates.append({
                'book': book,
                'final_score': float(final_score),
                'component_scores': component_scores
            })

        # Sort by final score descending
        scored_candidates.sort(key=lambda x: x['final_score'], reverse=True)

        # 5. Diversification (Section 61): Prevent same author from dominating top results
        diversified_results = []
        author_counts = {}
        for item in scored_candidates:
            book = item['book']
            primary_author = book.authors.first()
            author_id = primary_author.id if primary_author else 0
            if author_counts.get(author_id, 0) < 2:
                diversified_results.append(item)
                author_counts[author_id] = author_counts.get(author_id, 0) + 1
            if len(diversified_results) >= top_k:
                break

        # 6. Generate Explanations and Persist Logs
        final_recommendations = []
        for item in diversified_results:
            book = item['book']
            reason = RecommendationExplanationService.generate_explanation(
                book, item['component_scores'], context=context
            )
            item['reason'] = reason

            if user and user.is_authenticated and log_events:
                try:
                    RecommendationLog.objects.create(
                        user=user,
                        book=book,
                        context=context,
                        final_score=round(item['final_score'], 3),
                        content_score=round(item['component_scores']['content'], 3),
                        collaborative_score=round(item['component_scores']['collab'], 3),
                        mood_score=round(item['component_scores']['mood'], 3),
                        preference_score=round(item['component_scores']['pref'], 3),
                        popularity_score=round(item['component_scores']['pop'], 3),
                        rating_score=round(item['component_scores']['rating'], 3),
                        recency_score=round(item['component_scores']['recency'], 3),
                        availability_score=round(item['component_scores']['availability'], 3),
                        reason=reason
                    )
                except Exception:
                    pass

            final_recommendations.append(item)

        return final_recommendations

    def _compute_preference_scores(self, user, candidates):
        scores = {}
        if not user or not user.is_authenticated or not hasattr(user, 'preferences'):
            return {b.id: 0.0 for b in candidates}

        pref = user.preferences
        pref_genre_ids = set(pref.preferred_genres.values_list('id', flat=True))
        pref_mood_ids = set(pref.preferred_moods.values_list('id', flat=True))
        pref_author_ids = set(pref.preferred_authors.values_list('id', flat=True))

        for b in candidates:
            score = 0.0
            b_genre_ids = set(b.genres.values_list('id', flat=True))
            b_mood_ids = set(b.moods.values_list('id', flat=True))
            b_author_ids = set(b.authors.values_list('id', flat=True))

            if pref_genre_ids and pref_genre_ids.intersection(b_genre_ids):
                score += 0.5
            if pref_mood_ids and pref_mood_ids.intersection(b_mood_ids):
                score += 0.3
            if pref_author_ids and pref_author_ids.intersection(b_author_ids):
                score += 0.2

            scores[b.id] = min(1.0, score)
        return scores

    def _compute_popularity_scores(self, candidates):
        # Calculate popularity by loan and favorite count
        borrow_counts = dict(Loan.objects.values('book_id').annotate(c=Count('id')).values_list('book_id', 'c'))
        fav_counts = dict(Favorite.objects.values('book_id').annotate(c=Count('id')).values_list('book_id', 'c'))

        raw_scores = {}
        for b in candidates:
            score = borrow_counts.get(b.id, 0) * 2.0 + fav_counts.get(b.id, 0) * 1.5 + b.ratings_count * 1.0
            raw_scores[b.id] = score

        max_v = max(raw_scores.values()) if raw_scores else 1.0
        if max_v <= 0:
            max_v = 1.0

        return {bid: min(1.0, v / max_v) for bid, v in raw_scores.items()}

    def _compute_recency_scores(self, candidates):
        years = [b.publication_year for b in candidates if b.publication_year]
        max_year = max(years) if years else 2026
        min_year = min(years) if years else 1900
        span = max(1, max_year - min_year)

        scores = {}
        for b in candidates:
            if b.publication_year:
                scores[b.id] = max(0.0, (b.publication_year - min_year) / span)
            else:
                scores[b.id] = 0.3
        return scores
