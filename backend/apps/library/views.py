from rest_framework import viewsets, permissions, status, filters
from rest_framework.views import APIView
from rest_framework.response import Response
from apps.common.permissions import IsLibrarianOrAdmin, IsAdminRole
from .models import InventoryItem, Loan, Reservation, Favorite, Wishlist, AuditLog
from .services import LibraryService
from .serializers import (
    InventoryItemSerializer, LoanSerializer, ReservationSerializer,
    FavoriteSerializer, WishlistSerializer, AuditLogSerializer
)

class BorrowBookView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        book_id = request.data.get('book_id')
        notes = request.data.get('notes', '')
        if not book_id:
            return Response({'error': {'code': 'MISSING_BOOK_ID', 'message': 'book_id is required'}}, status=status.HTTP_400_BAD_REQUEST)

        loan = LibraryService.borrow_book(request.user, book_id, notes)
        serializer = LoanSerializer(loan, context={'request': request})
        return Response({
            'message': f"Successfully borrowed '{loan.book.title}'. Due on {loan.due_date.strftime('%b %d, %Y')}.",
            'loan': serializer.data
        }, status=status.HTTP_201_CREATED)

class ReturnBookView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        loan_id = request.data.get('loan_id')
        if not loan_id:
            return Response({'error': {'code': 'MISSING_LOAN_ID', 'message': 'loan_id is required'}}, status=status.HTTP_400_BAD_REQUEST)

        loan = LibraryService.return_book(request.user, loan_id)
        serializer = LoanSerializer(loan, context={'request': request})
        return Response({
            'message': f"Successfully returned '{loan.book.title}'. Thank you!",
            'loan': serializer.data
        }, status=status.HTTP_200_OK)

class RenewLoanView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        loan_id = request.data.get('loan_id')
        if not loan_id:
            return Response({'error': {'code': 'MISSING_LOAN_ID', 'message': 'loan_id is required'}}, status=status.HTTP_400_BAD_REQUEST)

        loan = LibraryService.renew_loan(request.user, loan_id)
        serializer = LoanSerializer(loan, context={'request': request})
        return Response({
            'message': f"Loan renewed successfully. New due date is {loan.due_date.strftime('%b %d, %Y')}.",
            'loan': serializer.data
        }, status=status.HTTP_200_OK)

class ReserveBookView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        book_id = request.data.get('book_id')
        if not book_id:
            return Response({'error': {'code': 'MISSING_BOOK_ID', 'message': 'book_id is required'}}, status=status.HTTP_400_BAD_REQUEST)

        reservation = LibraryService.reserve_book(request.user, book_id)
        serializer = ReservationSerializer(reservation, context={'request': request})
        return Response({
            'message': f"Reserved successfully! Your position in line is #{reservation.queue_position}.",
            'reservation': serializer.data
        }, status=status.HTTP_201_CREATED)

class MyLoansView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        status_filter = request.query_params.get('status')
        loans = Loan.objects.filter(user=request.user).select_related('book', 'inventory_item')
        if status_filter:
            loans = loans.filter(status=status_filter.upper())
        serializer = LoanSerializer(loans, many=True, context={'request': request})
        return Response(serializer.data)

class MyReservationsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        reservations = Reservation.objects.filter(user=request.user).select_related('book')
        serializer = ReservationSerializer(reservations, many=True, context={'request': request})
        return Response(serializer.data)

class ToggleFavoriteView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        book_id = request.data.get('book_id')
        if not book_id:
            return Response({'error': {'code': 'MISSING_BOOK_ID', 'message': 'book_id is required'}}, status=status.HTTP_400_BAD_REQUEST)

        result = LibraryService.toggle_favorite(request.user, book_id)
        return Response(result, status=status.HTTP_200_OK)

class MyFavoritesView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        favs = Favorite.objects.filter(user=request.user).select_related('book')
        serializer = FavoriteSerializer(favs, many=True, context={'request': request})
        return Response(serializer.data)

class ToggleWishlistView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        book_id = request.data.get('book_id')
        if not book_id:
            return Response({'error': {'code': 'MISSING_BOOK_ID', 'message': 'book_id is required'}}, status=status.HTTP_400_BAD_REQUEST)

        result = LibraryService.toggle_wishlist(request.user, book_id)
        return Response(result, status=status.HTTP_200_OK)

class MyWishlistView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        items = Wishlist.objects.filter(user=request.user).select_related('book')
        serializer = WishlistSerializer(items, many=True, context={'request': request})
        return Response(serializer.data)

class AdminLoansViewSet(viewsets.ModelViewSet):
    queryset = Loan.objects.all().select_related('user', 'book', 'inventory_item')
    serializer_class = LoanSerializer
    permission_classes = [IsLibrarianOrAdmin]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['user__email', 'book__title', 'status']
    ordering_fields = ['issue_date', 'due_date', 'return_date']

class AdminInventoryViewSet(viewsets.ModelViewSet):
    queryset = InventoryItem.objects.all().select_related('book')
    serializer_class = InventoryItemSerializer
    permission_classes = [IsLibrarianOrAdmin]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['copy_code', 'book__title', 'status']

class AdminAuditLogsView(APIView):
    permission_classes = [IsAdminRole]

    def get(self, request):
        logs = AuditLog.objects.all().select_related('actor')[:100]
        serializer = AuditLogSerializer(logs, many=True)
        return Response(serializer.data)
