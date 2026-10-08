from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.conf import settings
from apps.common.models import TimeStampedModel

class Author(TimeStampedModel):
    name = models.CharField(max_length=255, db_index=True)
    biography = models.TextField(blank=True, default='')
    photo_url = models.URLField(blank=True, default='')
    photo = models.ImageField(upload_to='authors/', blank=True, null=True)
    nationality = models.CharField(max_length=100, blank=True, default='')

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name

class Category(TimeStampedModel):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=120, unique=True)
    description = models.TextField(blank=True, default='')

    class Meta:
        verbose_name_plural = 'Categories'
        ordering = ['name']

    def __str__(self):
        return self.name

class Genre(TimeStampedModel):
    name = models.CharField(max_length=100, unique=True, db_index=True)
    slug = models.SlugField(max_length=120, unique=True)
    description = models.TextField(blank=True, default='')
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True, related_name='genres')

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name

class Mood(TimeStampedModel):
    """
    Dedicated Mood Entity for mood-based discovery and recommendation signals.
    Specification requirement: Sad, Romantic, Historical, Inspirational, Motivational,
    Emotional, Happy, Mysterious, Adventurous, Relaxing, Educational, Philosophical,
    Dark, Humorous, Suspenseful, Nostalgic, Hopeful, Dramatic.
    """
    name = models.CharField(max_length=100, unique=True, db_index=True)
    slug = models.SlugField(max_length=120, unique=True)
    description = models.TextField(blank=True, default='')
    color_code = models.CharField(max_length=20, default='#3B82F6')
    icon = models.CharField(max_length=50, default='Smile')

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name

class Tag(TimeStampedModel):
    name = models.CharField(max_length=100, unique=True, db_index=True)
    slug = models.SlugField(max_length=120, unique=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name

class Book(TimeStampedModel):
    isbn = models.CharField(max_length=20, unique=True, db_index=True, blank=True, null=True)
    title = models.CharField(max_length=255, db_index=True)
    subtitle = models.CharField(max_length=255, blank=True, default='')
    description = models.TextField(blank=True, default='')
    cover_image_url = models.URLField(blank=True, default='')
    cover_image = models.ImageField(upload_to='book_covers/', blank=True, null=True)
    publication_year = models.PositiveIntegerField(null=True, blank=True, db_index=True)
    publisher = models.CharField(max_length=255, blank=True, default='')
    language = models.CharField(max_length=50, default='English', db_index=True)
    page_count = models.PositiveIntegerField(default=250)

    # Relations
    authors = models.ManyToManyField(Author, related_name='books', blank=True)
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True, related_name='books')
    genres = models.ManyToManyField(Genre, related_name='books', blank=True)
    moods = models.ManyToManyField(Mood, related_name='books', blank=True)
    tags = models.ManyToManyField(Tag, related_name='books', blank=True)

    # Inventory cached snapshot (atomic truth is maintained via transactions)
    total_copies = models.PositiveIntegerField(default=5)
    available_copies = models.PositiveIntegerField(default=5)

    # Ratings cached snapshot
    average_rating = models.FloatField(default=0.0, db_index=True)
    ratings_count = models.PositiveIntegerField(default=0)

    # Soft delete / archive
    is_active = models.BooleanField(default=True, db_index=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['title', 'average_rating']),
            models.Index(fields=['available_copies', 'is_active']),
        ]

    def __str__(self):
        return self.title

    @property
    def is_available(self):
        return self.is_active and self.available_copies > 0

    def update_rating_statistics(self):
        ratings = self.ratings.all()
        count = ratings.count()
        if count == 0:
            self.average_rating = 0.0
            self.ratings_count = 0
        else:
            avg = sum(r.score for r in ratings) / count
            self.average_rating = round(avg, 2)
            self.ratings_count = count
        self.save(update_fields=['average_rating', 'ratings_count'])

class Rating(TimeStampedModel):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='ratings')
    book = models.ForeignKey(Book, on_delete=models.CASCADE, related_name='ratings')
    score = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        help_text="Rating score between 1 and 5"
    )

    class Meta:
        unique_together = ('user', 'book')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.email} -> {self.book.title}: {self.score}★"

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        self.book.update_rating_statistics()

    def delete(self, *args, **kwargs):
        book = self.book
        super().delete(*args, **kwargs)
        book.update_rating_statistics()

class Review(TimeStampedModel):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='reviews')
    book = models.ForeignKey(Book, on_delete=models.CASCADE, related_name='reviews')
    content = models.TextField()
    is_approved = models.BooleanField(default=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Review by {self.user.email} on {self.book.title}"
