from django.utils import timezone
from datetime import timedelta
from django.db.models import Sum, Avg, Count, F
from .models import ReadingSession, UserStreak, SearchEvent
from apps.books.models import Book, Genre, Mood
from apps.library.models import Loan
from apps.recommendations.models import RecommendationLog, RecommendationEvent
from django.contrib.auth import get_user_model

User = get_user_model()

class ScreenTimeAnalyticsService:
    @staticmethod
    def get_user_analytics(user):
        now = timezone.now()
        today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        week_start = now - timedelta(days=7)
        month_start = now - timedelta(days=30)

        sessions = ReadingSession.objects.filter(user=user, is_completed=True)

        total_seconds = sessions.aggregate(total=Sum('duration_seconds'))['total'] or 0
        today_seconds = sessions.filter(started_at__gte=today_start).aggregate(total=Sum('duration_seconds'))['total'] or 0
        week_seconds = sessions.filter(started_at__gte=week_start).aggregate(total=Sum('duration_seconds'))['total'] or 0
        month_seconds = sessions.filter(started_at__gte=month_start).aggregate(total=Sum('duration_seconds'))['total'] or 0
        avg_session_seconds = int(sessions.aggregate(avg=Avg('duration_seconds'))['avg'] or 0)
        total_sessions_count = sessions.count()

        # Streak
        streak_obj, _ = UserStreak.objects.get_or_create(user=user)

        # Reading Goal Progress
        goal_minutes_per_day = 30
        if hasattr(user, 'profile'):
            goal_minutes_per_day = user.profile.reading_goal_minutes_per_day or 30

        today_minutes = round(today_seconds / 60, 1)
        goal_progress_percent = min(100.0, round((today_minutes / goal_minutes_per_day) * 100, 1)) if goal_minutes_per_day > 0 else 100.0

        # Last 7 Days Daily Breakdown for Charts
        daily_trends = []
        for i in range(6, -1, -1):
            day_dt = now - timedelta(days=i)
            day_str = day_dt.strftime('%a')
            d_start = day_dt.replace(hour=0, minute=0, second=0, microsecond=0)
            d_end = d_start + timedelta(days=1)

            day_sec = sessions.filter(started_at__gte=d_start, started_at__lt=d_end).aggregate(t=Sum('duration_seconds'))['t'] or 0
            daily_trends.append({
                'day': day_str,
                'date': day_dt.strftime('%b %d'),
                'minutes': round(day_sec / 60, 1),
                'seconds': day_sec
            })

        # Genre & Mood Distribution of Read Books
        read_books = Book.objects.filter(reading_sessions__user=user, reading_sessions__is_completed=True).distinct()
        
        genre_dist = list(Genre.objects.filter(books__in=read_books).annotate(
            book_count=Count('books')
        ).order_by('-book_count').values('name', 'book_count')[:6])

        mood_dist = list(Mood.objects.filter(books__in=read_books).annotate(
            book_count=Count('books')
        ).order_by('-book_count').values('name', 'color_code', 'book_count')[:6])

        return {
            'today_seconds': today_seconds,
            'today_formatted': ScreenTimeAnalyticsService._format_duration(today_seconds),
            'week_seconds': week_seconds,
            'week_formatted': ScreenTimeAnalyticsService._format_duration(week_seconds),
            'month_seconds': month_seconds,
            'month_formatted': ScreenTimeAnalyticsService._format_duration(month_seconds),
            'total_seconds': total_seconds,
            'total_formatted': ScreenTimeAnalyticsService._format_duration(total_seconds),
            'total_sessions': total_sessions_count,
            'avg_session_seconds': avg_session_seconds,
            'avg_session_formatted': ScreenTimeAnalyticsService._format_duration(avg_session_seconds),
            'current_streak_days': streak_obj.current_streak,
            'longest_streak_days': streak_obj.longest_streak,
            'goal_minutes_per_day': goal_minutes_per_day,
            'goal_progress_percent': goal_progress_percent,
            'daily_trends': daily_trends,
            'genre_distribution': genre_dist,
            'mood_distribution': mood_dist,
        }

    @staticmethod
    def get_admin_analytics():
        total_books = Book.objects.filter(is_active=True).count()
        total_users = User.objects.count()
        active_loans = Loan.objects.filter(status=Loan.Status.ACTIVE).count()
        overdue_loans = Loan.objects.filter(status=Loan.Status.ACTIVE, due_date__lt=timezone.now()).count()
        
        total_screen_time_sec = ReadingSession.objects.filter(is_completed=True).aggregate(t=Sum('duration_seconds'))['t'] or 0

        # Top Genres
        popular_genres = list(Genre.objects.annotate(
            loans_count=Count('books__loans')
        ).order_by('-loans_count').values('name', 'loans_count')[:5])

        # Top Moods
        popular_moods = list(Mood.objects.annotate(
            loans_count=Count('books__loans')
        ).order_by('-loans_count').values('name', 'color_code', 'loans_count')[:5])

        # Recommendation KPIs
        total_impressions = RecommendationEvent.objects.filter(event_type=RecommendationEvent.EventType.IMPRESSION).count() or 1
        total_clicks = RecommendationEvent.objects.filter(event_type=RecommendationEvent.EventType.CLICK).count()
        total_borrows = RecommendationEvent.objects.filter(event_type=RecommendationEvent.EventType.BORROW).count()
        ctr = round((total_clicks / total_impressions) * 100, 2)

        # 7-day platform reading activity
        now = timezone.now()
        reading_trends = []
        for i in range(6, -1, -1):
            day_dt = now - timedelta(days=i)
            d_start = day_dt.replace(hour=0, minute=0, second=0, microsecond=0)
            d_end = d_start + timedelta(days=1)
            day_sec = ReadingSession.objects.filter(
                is_completed=True, started_at__gte=d_start, started_at__lt=d_end
            ).aggregate(t=Sum('duration_seconds'))['t'] or 0

            reading_trends.append({
                'day': day_dt.strftime('%a'),
                'date': day_dt.strftime('%b %d'),
                'hours': round(day_sec / 3600, 1),
            })

        return {
            'total_books': total_books,
            'total_users': total_users,
            'active_loans': active_loans,
            'overdue_loans': overdue_loans,
            'total_reading_time_hours': round(total_screen_time_sec / 3600, 1),
            'recommendation_ctr': ctr,
            'recommendation_conversions': total_borrows,
            'popular_genres': popular_genres,
            'popular_moods': popular_moods,
            'reading_trends': reading_trends,
        }

    @staticmethod
    def _format_duration(seconds):
        hours = seconds // 3600
        minutes = (seconds % 3600) // 60
        if hours > 0:
            return f"{hours}h {minutes}m"
        return f"{minutes}m"
