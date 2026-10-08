from rest_framework.views import APIView
from rest_framework.response import Response
from apps.common.pagination import StandardResultsSetPagination
from apps.books.serializers import BookListSerializer
from .services import SearchService

class AdvancedSearchView(APIView):
    pagination_class = StandardResultsSetPagination

    def get(self, request):
        qs = SearchService.execute_search(request.query_params, user=request.user)
        paginator = self.pagination_class()
        page = paginator.paginate_queryset(qs, request)
        serializer = BookListSerializer(page, many=True, context={'request': request})
        return paginator.get_paginated_response(serializer.data)

class AutocompleteView(APIView):
    def get(self, request):
        query = request.query_params.get('q', '')
        suggestions = SearchService.get_autocomplete_suggestions(query)
        return Response(suggestions)
