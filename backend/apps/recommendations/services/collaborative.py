import numpy as np
import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity
from django.conf import settings
from apps.books.models import Rating
from apps.library.models import Favorite, Loan, Wishlist

class CollaborativeRecommender:
    """
    Genuine Item-Based Collaborative Filtering Recommender.
    Specification Sections 46-48, 187.
    Returns real computed collaborative affinity scores or clean fallback when data is sparse.
    """
    def __init__(self):
        self.min_interactions = settings.RECOMMENDATION_CONFIG.get('MIN_COLLABORATIVE_INTERACTIONS', 3)

    def _build_interaction_dataframe(self):
        """
        Gathers user interactions and builds a sparse interaction table.
        """
        records = []

        # Ratings
        for r in Rating.objects.all():
            records.append({'user_id': r.user_id, 'book_id': r.book_id, 'interaction_weight': float(r.score)})

        # Favorites
        for f in Favorite.objects.all():
            records.append({'user_id': f.user_id, 'book_id': f.book_id, 'interaction_weight': 4.0})

        # Loans
        for l in Loan.objects.all():
            records.append({'user_id': l.user_id, 'book_id': l.book_id, 'interaction_weight': 3.5})

        # Wishlists
        for w in Wishlist.objects.all():
            records.append({'user_id': w.user_id, 'book_id': w.book_id, 'interaction_weight': 2.0})

        if not records:
            return None

        df = pd.DataFrame(records)
        # Aggregate duplicates by taking the maximum interaction weight
        df = df.groupby(['user_id', 'book_id'], as_index=False)['interaction_weight'].max()
        return df

    def compute_user_collaborative_scores(self, user):
        """
        Computes item-based collaborative filtering predictions for candidate books.
        Returns dict of {book_id: normalized_collab_score [0.0 to 1.0]}.
        """
        if not user or not user.is_authenticated:
            return {}

        df = self._build_interaction_dataframe()
        if df is None or len(df) < self.min_interactions:
            # Cold start / sparse interaction fallback
            return {}

        # Pivot into User-Item Matrix (Rows: items, Columns: users)
        item_user_matrix = df.pivot(index='book_id', columns='user_id', values='interaction_weight').fillna(0)

        # Ensure user is present in interaction matrix
        if user.id not in item_user_matrix.columns:
            return {}

        user_ratings = item_user_matrix[user.id]
        rated_book_ids = user_ratings[user_ratings > 0].index.tolist()

        if not rated_book_ids:
            return {}

        # Compute item-item cosine similarity matrix
        item_sim = cosine_similarity(item_user_matrix)
        item_sim_df = pd.DataFrame(item_sim, index=item_user_matrix.index, columns=item_user_matrix.index)

        # Calculate predicted scores for unrated books
        unrated_books = item_user_matrix.index.difference(rated_book_ids)
        scores = {}

        for target_book_id in unrated_books:
            # Similarity of target book with all books rated by user
            sim_with_rated = item_sim_df.loc[target_book_id, rated_book_ids]
            user_scores = user_ratings[rated_book_ids]

            sim_sum = np.sum(np.abs(sim_with_rated))
            if sim_sum > 0:
                predicted_val = np.dot(sim_with_rated, user_scores) / sim_sum
                scores[target_book_id] = float(predicted_val)

        if not scores:
            return {}

        # Normalize to [0.0, 1.0]
        vals = list(scores.values())
        min_v, max_v = min(vals), max(vals)
        range_v = max_v - min_v if max_v > min_v else 1.0

        normalized_scores = {}
        for bid, val in scores.items():
            normalized_scores[bid] = max(0.0, min(1.0, (val - min_v) / range_v))

        return normalized_scores
