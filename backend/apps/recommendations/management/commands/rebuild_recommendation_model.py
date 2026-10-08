from django.core.management.base import BaseCommand
from apps.recommendations.services.content_based import ContentBasedRecommender

class Command(BaseCommand):
    help = 'Rebuilds the TF-IDF vectorizer and feature matrices for content-based book recommendations.'

    def handle(self, *args, **options):
        self.stdout.write("Extracting catalog metadata and computing TF-IDF matrices...")
        recommender = ContentBasedRecommender()
        success = recommender.build_model()
        if success:
            self.stdout.write(self.style.SUCCESS(
                f"Successfully rebuilt recommendation artifacts ({len(recommender.book_ids)} books indexed)."
            ))
        else:
            self.stdout.write(self.style.WARNING("No active books found to index."))
