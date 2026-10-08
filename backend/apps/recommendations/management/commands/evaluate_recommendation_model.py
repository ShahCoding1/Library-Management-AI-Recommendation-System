from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
import numpy as np
from apps.books.models import Book, Rating
from apps.recommendations.services.hybrid_service import HybridRecommendationService

User = get_user_model()

class Command(BaseCommand):
    help = 'Evaluates hybrid recommendation engine accuracy, Precision@K, Recall@K, Hit Rate@K, and Catalog Coverage.'

    def add_arguments(self, parser):
        parser.add_argument('--k', type=int, default=5, help='Top-K cutoff for evaluation')

    def handle(self, *args, **options):
        k = options['k']
        self.stdout.write(f"\n--- Running Recommendation Model Evaluation (K={k}) ---")

        service = HybridRecommendationService()
        users = User.objects.filter(role=User.Role.READER)

        all_books_count = Book.objects.filter(is_active=True).count()
        if all_books_count == 0:
            self.stdout.write(self.style.ERROR("No books available for evaluation."))
            return

        recommended_book_ids = set()
        precisions = []
        recalls = []
        hit_rates = []
        ndcgs = []

        for user in users:
            # Ground truth: books the user rated >= 4 stars
            ground_truth = set(Rating.objects.filter(user=user, score__gte=4).values_list('book_id', flat=True))
            if not ground_truth:
                continue

            recs = service.get_recommendations(user=user, top_k=k, log_events=False)
            rec_ids = [r['book'].id for r in recs]
            recommended_book_ids.update(rec_ids)

            # Hits
            hits = ground_truth.intersection(set(rec_ids))
            hit_count = len(hits)

            # Precision@K = |Hits| / K
            prec = hit_count / k
            precisions.append(prec)

            # Recall@K = |Hits| / |GroundTruth|
            rec = hit_count / len(ground_truth)
            recalls.append(rec)

            # Hit Rate@K (1 if hit_count > 0 else 0)
            hit_rates.append(1.0 if hit_count > 0 else 0.0)

            # NDCG@K
            dcg = 0.0
            idcg = sum(1.0 / np.log2(i + 2) for i in range(min(k, len(ground_truth))))
            for rank_idx, bid in enumerate(rec_ids):
                if bid in ground_truth:
                    dcg += 1.0 / np.log2(rank_idx + 2)
            ndcg = (dcg / idcg) if idcg > 0 else 0.0
            ndcgs.append(ndcg)

        # Catalog Coverage
        coverage = (len(recommended_book_ids) / all_books_count) * 100

        avg_precision = np.mean(precisions) if precisions else 0.0
        avg_recall = np.mean(recalls) if recalls else 0.0
        avg_hit_rate = np.mean(hit_rates) if hit_rates else 0.0
        avg_ndcg = np.mean(ndcgs) if ndcgs else 0.0

        self.stdout.write(f"Evaluated Users:            {len(precisions)}")
        self.stdout.write(f"Total Catalog Size:         {all_books_count} books")
        self.stdout.write(f"Catalog Coverage:           {coverage:.1f}%")
        self.stdout.write(f"Precision@{k}:               {avg_precision:.3f}")
        self.stdout.write(f"Recall@{k}:                  {avg_recall:.3f}")
        self.stdout.write(f"Hit Rate@{k}:                {avg_hit_rate:.3f}")
        self.stdout.write(f"NDCG@{k}:                    {avg_ndcg:.3f}")
        self.stdout.write(self.style.SUCCESS("\nEvaluation completed successfully.\n"))
