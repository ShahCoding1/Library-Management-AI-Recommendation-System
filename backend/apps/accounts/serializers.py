from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import get_user_model
from .models import UserProfile, UserPreference

User = get_user_model()

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['email'] = user.email
        token['role'] = user.role
        token['full_name'] = user.full_name
        token['is_staff'] = user.is_staff
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        data['user'] = {
            'id': self.user.id,
            'email': self.user.email,
            'username': self.user.username,
            'full_name': self.user.full_name,
            'role': self.user.role,
            'is_admin': self.user.is_admin,
            'is_librarian': self.user.is_librarian,
        }
        return data

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = [
            'id', 'avatar_url', 'bio', 'reading_goal_minutes_per_day',
            'reading_goal_books_per_month', 'email_notifications', 'due_date_reminders'
        ]

class UserPreferenceSerializer(serializers.ModelSerializer):
    preferred_genre_ids = serializers.PrimaryKeyRelatedField(
        many=True, read_only=False, queryset=UserPreference.preferred_genres.field.related_model.objects.all(),
        source='preferred_genres', required=False
    )
    preferred_mood_ids = serializers.PrimaryKeyRelatedField(
        many=True, read_only=False, queryset=UserPreference.preferred_moods.field.related_model.objects.all(),
        source='preferred_moods', required=False
    )
    preferred_author_ids = serializers.PrimaryKeyRelatedField(
        many=True, read_only=False, queryset=UserPreference.preferred_authors.field.related_model.objects.all(),
        source='preferred_authors', required=False
    )

    class Meta:
        model = UserPreference
        fields = [
            'id', 'preferred_genres', 'preferred_moods', 'preferred_authors',
            'preferred_genre_ids', 'preferred_mood_ids', 'preferred_author_ids',
            'onboarding_completed'
        ]
        depth = 1

class UserSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer(read_only=True)
    preferences = UserPreferenceSerializer(read_only=True)
    is_admin = serializers.BooleanField(read_only=True)
    is_librarian = serializers.BooleanField(read_only=True)

    class Meta:
        model = User
        fields = [
            'id', 'email', 'username', 'full_name', 'role',
            'is_active', 'is_admin', 'is_librarian', 'date_joined',
            'profile', 'preferences'
        ]
        read_only_fields = ['id', 'date_joined', 'is_admin', 'is_librarian']

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    preferred_mood_ids = serializers.ListField(child=serializers.IntegerField(), required=False, write_only=True)
    preferred_genre_ids = serializers.ListField(child=serializers.IntegerField(), required=False, write_only=True)

    class Meta:
        model = User
        fields = ['id', 'email', 'password', 'full_name', 'preferred_mood_ids', 'preferred_genre_ids']

    def create(self, validated_data):
        mood_ids = validated_data.pop('preferred_mood_ids', [])
        genre_ids = validated_data.pop('preferred_genre_ids', [])
        password = validated_data.pop('password')

        user = User.objects.create_user(
            email=validated_data['email'],
            password=password,
            full_name=validated_data.get('full_name', ''),
            role=User.Role.READER
        )
        
        profile = UserProfile.objects.create(user=user)
        preferences = UserPreference.objects.create(user=user)
        
        if mood_ids:
            preferences.preferred_moods.set(mood_ids)
        if genre_ids:
            preferences.preferred_genres.set(genre_ids)
        if mood_ids or genre_ids:
            preferences.onboarding_completed = True
            preferences.save()

        # Create user streak record
        from apps.analytics.models import UserStreak
        UserStreak.objects.get_or_create(user=user)

        return user
