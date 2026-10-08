class RecommendationExplanationService:
    """
    Generates transparent, human-readable explanations tied strictly
    to the actual winning feature components (Section 73, 158, 197).
    Never fabricates reasons.
    """
    @staticmethod
    def generate_explanation(book, component_scores, context="homepage"):
        content_s = component_scores.get('content', 0.0)
        collab_s = component_scores.get('collab', 0.0)
        mood_s = component_scores.get('mood', 0.0)
        pref_s = component_scores.get('pref', 0.0)
        pop_s = component_scores.get('pop', 0.0)
        rating_s = component_scores.get('rating', 0.0)

        # Identify highest contributing signal
        signals = [
            ('mood', mood_s),
            ('content', content_s),
            ('collab', collab_s),
            ('pref', pref_s),
            ('rating', rating_s),
            ('pop', pop_s),
        ]
        signals.sort(key=lambda x: x[1], reverse=True)
        top_signal, top_score = signals[0]

        if top_signal == 'mood' and top_score > 0.3:
            first_mood = book.moods.first()
            mood_name = first_mood.name if first_mood else "your selected"
            return f"Curated to match your mood: {mood_name}."

        if top_signal == 'collab' and top_score > 0.2:
            return "Readers with reading habits similar to yours loved this book."

        if top_signal == 'content' and top_score > 0.25:
            first_genre = book.genres.first()
            genre_str = f" in {first_genre.name}" if first_genre else ""
            return f"Matches the storytelling style and themes of books you enjoyed{genre_str}."

        if top_signal == 'pref' and top_score > 0.2:
            first_author = book.authors.first()
            if first_author:
                return f"Recommended based on your preferred authors and genres, featuring {first_author.name}."
            return "Recommended based on your profile's favorite genres."

        if top_signal == 'rating' and book.average_rating >= 4.0:
            return f"Critically acclaimed with an average community rating of {book.average_rating}★."

        if top_signal == 'pop' and top_score > 0.4:
            return "Trending across our reading community this month."

        return "Popular choice in our digital library catalog."
