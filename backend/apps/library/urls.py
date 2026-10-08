from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    BorrowBookView, ReturnBookView, RenewLoanView, ReserveBookView,
    MyLoansView, MyReservationsView, ToggleFavoriteView, MyFavoritesView,
    ToggleWishlistView, MyWishlistView, AdminLoansViewSet,
    AdminInventoryViewSet, AdminAuditLogsView
)

router = DefaultRouter()
router.register(r'admin/loans', AdminLoansViewSet, basename='admin-loans')
router.register(r'admin/inventory', AdminInventoryViewSet, basename='admin-inventory')

urlpatterns = [
    path('borrow/', BorrowBookView.as_view(), name='borrow_book'),
    path('return/', ReturnBookView.as_view(), name='return_book'),
    path('renew/', RenewLoanView.as_view(), name='renew_loan'),
    path('reserve/', ReserveBookView.as_view(), name='reserve_book'),
    path('my-loans/', MyLoansView.as_view(), name='my_loans'),
    path('my-reservations/', MyReservationsView.as_view(), name='my_reservations'),
    path('favorites/toggle/', ToggleFavoriteView.as_view(), name='toggle_favorite'),
    path('my-favorites/', MyFavoritesView.as_view(), name='my_favorites'),
    path('wishlist/toggle/', ToggleWishlistView.as_view(), name='toggle_wishlist'),
    path('my-wishlist/', MyWishlistView.as_view(), name='my_wishlist'),
    path('admin/audit-logs/', AdminAuditLogsView.as_view(), name='admin_audit_logs'),
    path('', include(router.urls)),
]
