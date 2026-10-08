"""
URL configuration for Book Recommendation, Screen-Time & Library Management System.
Master API version: v1
"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # Versioned API routes (/api/v1/)
    path('api/v1/auth/', include('apps.accounts.urls_auth')),
    path('api/v1/users/', include('apps.accounts.urls_users')),
    path('api/v1/books/', include('apps.books.urls')),
    path('api/v1/library/', include('apps.library.urls')),
    path('api/v1/search/', include('apps.search.urls')),
    path('api/v1/recommendations/', include('apps.recommendations.urls')),
    path('api/v1/analytics/', include('apps.analytics.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
