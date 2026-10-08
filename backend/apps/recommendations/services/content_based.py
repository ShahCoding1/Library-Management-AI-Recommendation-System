import os
import pickle
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from django.conf import settings
from apps.books.models import Book, Rating
from apps.library.models import Favorite, Loan, Wishlist

class ContentBasedRecommender:
    """
    Genuine TF-IDF & Cosine Similarity Content-Based Recommender.
    Specification Sections 39-44, 65, 184-188.
    Zero mock/hard-coded scores.
    """
    def __init__(self):
        self.artifacts_dir = settings.RECOMMENDATION_CONFIG['ARTIFACTS_DIR']
        self.vectorizer_path = os.path.join(self.artifacts_dir, 'tfidf_vectorizer.pkl')
        self.matrix_path = os.path.join(self.artifacts_dir, 'book_feature_matrix.pkl')
        self.book_ids_path = os.path.join(self.artifacts_dir, 'book_ids.pkl')
        self.vectorizer = None
        self.book_matrix = None
        self.book_ids = []
        self._load_or_build_model()

    def _extract_book_text(self, book):
        """Constructs combined normalized text profile for a book."""
        authors = " ".join([a.name for a in book.authors.all()])
        genres = " ".join([g.name for g in book.genres.all()])
        moods = " ".join([m.name for m in book.moods.all()])
        tags = " ".join([t.name for t in book.tags.all()])
        category = book.category.name if book.category else ""

        # Weight key metadata by repeating terms in content profile
        text_parts = [
            book.title,
            book.title,  # duplicate for weighting
            book.subtitle or "",
            authors,
            authors,
            genres,
            genres,
            moods,
            moods,
            tags,
            category,
            book.description or ""
        ]
        return " ".join(filter(None, text_parts)).lower()

    def build_model(self):
        """
        Builds and persists TF-IDF vectorizer and book feature matrix.
        """
        books = list(Book.objects.filter(is_active=True).prefetch_related(
            'authors', 'genres', 'moods', 'tags'
        ).select_related('category'))

        if not books:
            return False

        corpus = [self._extract_book_text(b) for b in books]
        self.book_ids = [b.id for b in books]

        self.vectorizer = TfidfVectorizer(
            stop_words='english',
            max_features=5000,
            ngram_range=(1, 2),
            sublinear_tf=True
        )
        self.book_matrix = self.vectorizer.fit_transform(corpus)

        # Persist artifacts safely
        os.makedirs(self.artifacts_dir, exist_ok=True)
        with open(self.vectorizer_path, 'wb') as f:
            pickle.dump(self.vectorizer, f)
        with open(self.matrix_path, 'wb') as f:
            pickle.dump(self.book_matrix, f)
        with open(self.book_ids_path, 'wb') as f:
            pickle.dump(self.book_ids, f)

        return True

    def _load_or_build_model(self):
        """Loads precomputed model or builds if artifacts do not exist."""
        if (os.path.exists(self.vectorizer_path) and
            os.path.exists(self.matrix_path) and
            os.path.exists(self.book_ids_path)):
            try:
                with open(self.vectorizer_path, 'rb') as f:
                    self.vectorizer = pickle.load(f)
                with open(self.matrix_path, 'rb') as f:
                    self.book_matrix = pickle.load(f)
                with open(self.book_ids_path, 'rb') as f:
                    self.book_ids = pickle.load(f)
                return
            except Exception:
                pass
        self.build_model()

    def get_similar_books(self, book_id, top_k=6):
        """
        Returns similar books using cosine similarity of TF-IDF vectors.
        """
        if self.book_matrix is None or book_id not in self.book_ids:
            self.build_model()
            if self.book_matrix is None or book_id not in self.book_ids:
                return Book.objects.filter(is_active=True).exclude(id=book_id)[:top_k]

        idx = self.book_ids.index(book_id)
        book_vector = self.book_matrix[idx]
        sim_scores = cosine_similarity(book_vector, self.book_matrix).flatten()

        # Sort indices by descending similarity
        related_indices = sim_scores.argsort()[::-1]

        similar_book_ids = []
        for i in related_indices:
            candidate_id = self.book_ids[i]
            if candidate_id != book_id:
                similar_book_ids.append(candidate_id)
            if len(similar_book_ids) >= top_k:
                break

        # Preserve ordering
        books_dict = {b.id: b for b in Book.objects.filter(id__in=similar_book_ids).prefetch_related(
            'authors', 'genres', 'moods', 'tags'
        )}
        return [books_dict[bid] for bid in similar_book_ids if bid in books_dict]

    def compute_user_content_scores(self, user):
        """
        Builds a normalized User Preference Vector from user interactions:
        5-star: +5, 4-star: +4, 3-star: +2, 2-star: -2, 1-star: -5,
        Favorite: +4, Borrow: +3, Wishlist: +2 (Section 44).
        Computes cosine similarity between user vector and all candidate books.
        Returns dict of {book_id: normalized_content_score [0.0 to 1.0]}.
        """
        if not user or not user.is_authenticated or self.book_matrix is None:
            return {}

        book_weights = {}

        # Ratings
        ratings = Rating.objects.filter(user=user)
        for r in ratings:
            weight_map = {5: 5.0, 4: 4.0, 3: 2.0, 2: -2.0, 1: -5.0}
            book_weights[r.book_id] = book_weights.get(r.book_id, 0.0) + weight_map.get(r.score, 0.0)

        # Favorites
        for fav in Favorite.objects.filter(user=user):
            book_weights[fav.book_id] = book_weights.get(fav.book_id, 0.0) + 4.0

        # Loans
        for loan in Loan.objects.filter(user=user):
            book_weights[loan.book_id] = book_weights.get(loan.book_id, 0.0) + 3.0

        # Wishlist
        for w in Wishlist.objects.filter(user=user):
            book_weights[w.book_id] = book_weights.get(w.book_id, 0.0) + 2.0

        if not book_weights:
            return {}

        # Construct aggregate user vector
        user_vector = np.zeros((1, self.book_matrix.shape[1]))
        total_weight = 0.0

        for bid, weight in book_weights.items():
            if bid in self.book_ids:
                b_idx = self.book_ids.index(bid)
                b_vec = self.book_matrix[b_idx].toarray()
                user_vector += weight * b_vec
                total_weight += abs(weight)

        if total_weight == 0 or np.linalg.norm(user_vector) == 0:
            return {}

        # Normalize user vector
        user_vector = user_vector / np.linalg.norm(user_vector)

        # Compute cosine similarity
        sim_scores = cosine_similarity(user_vector, self.book_matrix).flatten()

        # Min-max scale scores to [0.0, 1.0]
        min_s, max_s = sim_scores.min(), sim_scores.max()
        range_s = max_s - min_s if max_s > min_s else 1.0

        scores = {}
        for idx, score in enumerate(sim_scores):
            normalized_score = max(0.0, min(1.0, (score - min_s) / range_s))
            scores[self.book_ids[idx]] = float(normalized_score)

        return scores
