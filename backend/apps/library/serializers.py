from rest_framework import serializers
from .models import InventoryItem, Loan, Reservation, Favorite, Wishlist, AuditLog, SystemSetting
from apps.books.serializers import BookListSerializer

class InventoryItemSerializer(serializers.ModelSerializer):
    book_title = serializers.CharField(source='book.title', read_only=True)

    class Meta:
        model = InventoryItem
        fields = ['id', 'book', 'book_title', 'copy_code', 'status', 'notes', 'created_at']

class LoanSerializer(serializers.ModelSerializer):
    book = BookListSerializer(read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)
    user_name = serializers.CharField(source='user.full_name', read_only=True)
    copy_code = serializers.CharField(source='inventory_item.copy_code', read_only=True)
    is_overdue = serializers.BooleanField(read_only=True)

    class Meta:
        model = Loan
        fields = [
            'id', 'user', 'user_email', 'user_name', 'book',
            'inventory_item', 'copy_code', 'issue_date', 'due_date',
            'return_date', 'status', 'renewal_count', 'notes', 'is_overdue',
            'created_at'
        ]

class ReservationSerializer(serializers.ModelSerializer):
    book = BookListSerializer(read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)

    class Meta:
        model = Reservation
        fields = ['id', 'user', 'user_email', 'book', 'reservation_date', 'queue_position', 'status', 'notified_at']

class FavoriteSerializer(serializers.ModelSerializer):
    book = BookListSerializer(read_only=True)

    class Meta:
        model = Favorite
        fields = ['id', 'user', 'book', 'created_at']

class WishlistSerializer(serializers.ModelSerializer):
    book = BookListSerializer(read_only=True)

    class Meta:
        model = Wishlist
        fields = ['id', 'user', 'book', 'priority', 'created_at']

class AuditLogSerializer(serializers.ModelSerializer):
    actor_email = serializers.CharField(source='actor.email', read_only=True)

    class Meta:
        model = AuditLog
        fields = ['id', 'actor', 'actor_email', 'action', 'entity_type', 'entity_id', 'metadata', 'created_at']

class SystemSettingSerializer(serializers.ModelSerializer):
    class Meta:
        model = SystemSetting
        fields = ['id', 'key', 'value', 'description', 'updated_at']
