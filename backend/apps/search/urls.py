from django.urls import path
from .views import AdvancedSearchView, AutocompleteView

urlpatterns = [
    path('', AdvancedSearchView.as_view(), name='search_advanced'),
    path('autocomplete/', AutocompleteView.as_view(), name='search_autocomplete'),
]
