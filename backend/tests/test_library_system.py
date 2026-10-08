from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from apps.books.models import Book, Mood, Genre, Author, Rating
from apps.library.models import Loan, InventoryItem, Favorite
from apps.library.services import LibraryService
from apps.recommendations.services.hybrid_service import HybridRecommendationService
from apps.recommendations.services.content_based import ContentBasedRecommender
from apps.analytics.models import ReadingSession, UserStreak

User = get_user_model()

class LibrarySystemIntegrationTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()

        # Users
        self.reader = User.objects.create_user(
            email='testreader@library.com',
            password='Password123!',
            full_name='Test Reader',
            role=User.Role.READER
        )
        self.admin = User.objects.create_superuser(
            email='testadmin@library.com',
            password='AdminPassword123!',
            full_name='Admin User'
        )

        # Metadata
        self.author = Author.objects.create(name='Arthur C. Clarke')
        self.genre = Genre.objects.create(name='Sci-Fi', slug='sci-fi')
        self.mood_mysterious = Mood.objects.create(name='Mysterious', slug='mysterious', color_code='#6366F1')
        self.mood_adventurous = Mood.objects.create(name='Adventurous', slug='adventurous', color_code='#059669')

        # Books
        self.book1 = Book.objects.create(
            title='2001: A Space Odyssey',
            isbn='978-0451457998',
            publication_year=1968,
            total_copies=2,
            available_copies=2,
            description='A voyage into the deepest mysteries of space, alien monoliths, and artificial intelligence.'
        )
        self.book1.authors.add(self.author)
        self.book1.genres.add(self.genre)
        self.book1.moods.add(self.mood_mysterious, self.mood_adventurous)

        self.book2 = Book.objects.create(
            title='Rendezvous with Rama',
            isbn='978-0575077331',
            publication_year=1973,
            total_copies=1,
            available_copies=1,
            description='An expedition sent to explore an enigmatic alien cylinder entering the solar system.'
        )
        self.book2.authors.add(self.author)
        self.book2.genres.add(self.genre)
        self.book2.moods.add(self.mood_mysterious)

        # Inventory Items
        InventoryItem.objects.create(book=self.book1, copy_code='2001-001', status=InventoryItem.Status.AVAILABLE)
        InventoryItem.objects.create(book=self.book1, copy_code='2001-002', status=InventoryItem.Status.AVAILABLE)
        InventoryItem.objects.create(book=self.book2, copy_code='RAMA-001', status=InventoryItem.Status.AVAILABLE)

    def test_auth_login_and_token(self):
        """Test authentication endpoint issues valid JWT token."""
        response = self.client.post('/api/v1/auth/login/', {
            'email': 'testreader@library.com',
            'password': 'Password123!'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('user', response.data)
        self.assertEqual(response.data['user']['email'], 'testreader@library.com')

    def test_atomic_borrow_and_return_workflow(self):
        """Test atomic borrowing decrements available copies and return restores it."""
        # 1. Borrow book
        loan = LibraryService.borrow_book(self.reader, self.book1.id)
        self.assertEqual(loan.status, Loan.Status.ACTIVE)
        self.book1.refresh_from_db()
        self.assertEqual(self.book1.available_copies, 1)

        # 2. Prevent duplicate active loan for same book
        with self.assertRaises(Exception):
            LibraryService.borrow_book(self.reader, self.book1.id)

        # 3. Return book
        returned_loan = LibraryService.return_book(self.reader, loan.id)
        self.assertEqual(returned_loan.status, Loan.Status.RETURNED)
        self.book1.refresh_from_db()
        self.assertEqual(self.book1.available_copies, 2)

    def test_advanced_search_and_mood_filter(self):
        """Test search service filters by title and mood accurately."""
        # Search by mood
        res_mood = self.client.get('/api/v1/search/?mood=adventurous')
        self.assertEqual(res_mood.status_code, status.HTTP_200_OK)
        results = res_mood.data['results']
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]['id'], self.book1.id)

        # Search by query
        res_query = self.client.get('/api/v1/search/?q=Odyssey')
        self.assertEqual(res_query.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res_query.data['results']), 1)
        self.assertEqual(res_query.data['results'][0]['title'], '2001: A Space Odyssey')

    def test_recommendation_engine(self):
        """Test TF-IDF content similarity and hybrid ranking return explainable recommendations."""
        recommender = ContentBasedRecommender()
        recommender.build_model()
        similar_books = recommender.get_similar_books(self.book1.id, top_k=2)
        self.assertGreater(len(similar_books), 0)
        self.assertEqual(similar_books[0].id, self.book2.id)

        # Test hybrid recommendations with explainable reason
        hybrid_service = HybridRecommendationService()
        recs = hybrid_service.get_recommendations(user=self.reader, top_k=5, log_events=False)
        self.assertGreater(len(recs), 0)
        self.assertIn('reason', recs[0])
        self.assertIn('final_score', recs[0])

    def test_reading_session_and_streak_recording(self):
        """Test reading session lifecycle and user streak recording."""
        self.client.force_authenticate(user=self.reader)
        # Start session
        start_res = self.client.post('/api/v1/analytics/reading-sessions/start/', {'book_id': self.book1.id})
        self.assertEqual(start_res.status_code, status.HTTP_201_CREATED)
        session_id = start_res.data['id']

        # End session
        end_res = self.client.post(f'/api/v1/analytics/reading-sessions/{session_id}/end/', {'pages_read': 15})
        self.assertEqual(end_res.status_code, status.HTTP_200_OK)
        self.assertTrue(end_res.data['session']['is_completed'])
        self.assertEqual(end_res.data['session']['pages_read'], 15)

        # Verify streak updated
        streak = UserStreak.objects.get(user=self.reader)
        self.assertGreaterEqual(streak.current_streak, 1)

    def test_loan_renewal_limit(self):
        """Test loan renewal extends due date and is capped at 2 renewals."""
        loan = LibraryService.borrow_book(self.reader, self.book1.id)
        # Renewal 1
        r1 = LibraryService.renew_loan(self.reader, loan.id)
        self.assertEqual(r1.renewal_count, 1)

        # Renewal 2
        r2 = LibraryService.renew_loan(self.reader, loan.id)
        self.assertEqual(r2.renewal_count, 2)

        # Renewal 3 must fail
        with self.assertRaises(Exception):
            LibraryService.renew_loan(self.reader, loan.id)

    def test_reservations_and_favorites_toggle(self):
        """Test reservation queue and favorites toggle APIs."""
        self.client.force_authenticate(user=self.reader)
        
        # Toggle favorite
        fav_res = self.client.post('/api/v1/library/favorites/toggle/', {'book_id': self.book1.id})
        self.assertEqual(fav_res.status_code, status.HTTP_200_OK)
        self.assertTrue(fav_res.data['favorited'])

        # Toggle wishlist
        wish_res = self.client.post('/api/v1/library/wishlist/toggle/', {'book_id': self.book1.id})
        self.assertEqual(wish_res.status_code, status.HTTP_200_OK)
        self.assertTrue(wish_res.data['wishlisted'])

        # Reservation when all copies checked out (available_copies = 0)
        self.book1.available_copies = 0
        self.book1.save(update_fields=['available_copies'])
        res_res = self.client.post('/api/v1/library/reserve/', {'book_id': self.book1.id})
        self.assertEqual(res_res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(res_res.data['reservation']['queue_position'], 1)


    def test_admin_rebuild_and_role_management(self):
        """Test admin recommendation rebuild and user role update endpoints."""
        self.client.force_authenticate(user=self.admin)
        
        # Rebuild matrix
        rebuild_res = self.client.post('/api/v1/recommendations/admin/rebuild/')
        self.assertEqual(rebuild_res.status_code, status.HTTP_200_OK)
        self.assertEqual(rebuild_res.data['status'], 'success')

        # Update reader role to LIBRARIAN
        role_res = self.client.patch(f'/api/v1/users/admin/users/{self.reader.id}/', {'role': 'LIBRARIAN'})
        self.assertEqual(role_res.status_code, status.HTTP_200_OK)
        self.reader.refresh_from_db()
        self.assertEqual(self.reader.role, User.Role.LIBRARIAN)

