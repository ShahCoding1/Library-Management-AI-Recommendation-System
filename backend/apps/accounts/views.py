from rest_framework import generics, status, permissions, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import get_user_model
from apps.common.permissions import IsAdminRole
from .models import UserProfile, UserPreference
from .serializers import (
    UserSerializer, RegisterSerializer, UserProfileSerializer,
    UserPreferenceSerializer, CustomTokenObtainPairSerializer
)

User = get_user_model()

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

class MeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

    def patch(self, request):
        user = request.user
        full_name = request.data.get('full_name')
        if full_name is not None:
            user.full_name = full_name
            user.save(update_fields=['full_name'])
        serializer = UserSerializer(user)
        return Response(serializer.data)

class UserProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        profile, _ = UserProfile.objects.get_or_create(user=request.user)
        serializer = UserProfileSerializer(profile)
        return Response(serializer.data)

    def patch(self, request):
        profile, _ = UserProfile.objects.get_or_create(user=request.user)
        serializer = UserProfileSerializer(profile, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

class UserPreferencesView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        pref, _ = UserPreference.objects.get_or_create(user=request.user)
        serializer = UserPreferenceSerializer(pref)
        return Response(serializer.data)

    def post(self, request):
        pref, _ = UserPreference.objects.get_or_create(user=request.user)
        if 'preferred_genre_ids' in request.data:
            pref.preferred_genres.set(request.data['preferred_genre_ids'])
        if 'preferred_mood_ids' in request.data:
            pref.preferred_moods.set(request.data['preferred_mood_ids'])
        if 'preferred_author_ids' in request.data:
            pref.preferred_authors.set(request.data['preferred_author_ids'])
        pref.onboarding_completed = True
        pref.save()
        serializer = UserPreferenceSerializer(pref)
        return Response(serializer.data)

    def patch(self, request):
        return self.post(request)

class AdminUserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all().order_by('-date_joined')
    serializer_class = UserSerializer
    permission_classes = [IsAdminRole]

    def get_queryset(self):
        qs = super().get_queryset()
        role = self.request.query_params.get('role')
        search = self.request.query_params.get('search')
        if role:
            qs = qs.filter(role=role)
        if search:
            qs = qs.filter(email__icontains=search) | qs.filter(full_name__icontains=search)
        return qs
