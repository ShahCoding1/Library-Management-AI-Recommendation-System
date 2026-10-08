from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models
from apps.common.models import TimeStampedModel

class UserManager(BaseUserManager):
    """Custom user manager where email is the unique identifier for auth."""
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        extra_fields.setdefault('username', email.split('@')[0])
        extra_fields.setdefault('role', User.Role.READER)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', User.Role.ADMIN)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self.create_user(email, password, **extra_fields)

class User(AbstractUser):
    class Role(models.TextChoices):
        ADMIN = 'ADMIN', 'Administrator'
        LIBRARIAN = 'LIBRARIAN', 'Librarian'
        READER = 'READER', 'Reader / Registered User'
        GUEST = 'GUEST', 'Guest'

    email = models.EmailField(unique=True, db_index=True)
    role = models.CharField(max_length=20, choices=Role.choices, default=Role.READER, db_index=True)
    full_name = models.CharField(max_length=255, blank=True)

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    def __str__(self):
        return f"{self.email} ({self.role})"

    @property
    def is_admin(self):
        return self.is_superuser or self.role == self.Role.ADMIN

    @property
    def is_librarian(self):
        return self.role in (self.Role.LIBRARIAN, self.Role.ADMIN) or self.is_staff

class UserProfile(TimeStampedModel):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    avatar_url = models.URLField(blank=True, default='')
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    bio = models.TextField(blank=True, default='')
    reading_goal_minutes_per_day = models.PositiveIntegerField(default=30)
    reading_goal_books_per_month = models.PositiveIntegerField(default=2)
    email_notifications = models.BooleanField(default=True)
    due_date_reminders = models.BooleanField(default=True)

    def __str__(self):
        return f"Profile of {self.user.email}"

class UserPreference(TimeStampedModel):
    """
    Explicit user preferences captured during onboarding or profile editing.
    Directly powers cold-start recommendations and personalization scoring.
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='preferences')
    preferred_genres = models.ManyToManyField('books.Genre', blank=True, related_name='preferred_by_users')
    preferred_moods = models.ManyToManyField('books.Mood', blank=True, related_name='preferred_by_users')
    preferred_authors = models.ManyToManyField('books.Author', blank=True, related_name='preferred_by_users')
    onboarding_completed = models.BooleanField(default=False)

    def __str__(self):
        return f"Preferences of {self.user.email}"
