from django.db import models
from django.conf import settings
from django.utils import timezone
from datetime import timedelta
from apps.common.models import TimeStampedModel

class InventoryItem(TimeStampedModel):
    class Status(models.TextChoices):
        AVAILABLE = 'AVAILABLE', 'Available'
        BORROWED = 'BORROWED', 'Borrowed'
        RESERVED = 'RESERVED', 'Reserved'
        MAINTENANCE = 'MAINTENANCE', 'In Maintenance'
        LOST = 'LOST', 'Lost'

    book = models.ForeignKey('books.Book', on_delete=models.CASCADE, related_name='inventory_items')
    copy_code = models.CharField(max_length=50, unique=True, db_index=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.AVAILABLE, db_index=True)
    notes = models.TextField(blank=True, default='')

    def __str__(self):
        return f"{self.book.title} [Copy: {self.copy_code}] ({self.status})"

class Loan(TimeStampedModel):
    class Status(models.TextChoices):
        PENDING = 'PENDING', 'Pending Approval'
        ACTIVE = 'ACTIVE', 'Active / Borrowed'
        RETURNED = 'RETURNED', 'Returned'
        OVERDUE = 'OVERDUE', 'Overdue'
        LOST = 'LOST', 'Marked Lost'
        CANCELLED = 'CANCELLED', 'Cancelled'

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='loans')
    book = models.ForeignKey('books.Book', on_delete=models.CASCADE, related_name='loans')
    inventory_item = models.ForeignKey(InventoryItem, on_delete=models.SET_NULL, null=True, blank=True, related_name='loans')
    
    issue_date = models.DateTimeField(default=timezone.now)
    due_date = models.DateTimeField(db_index=True)
    return_date = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.ACTIVE, db_index=True)
    renewal_count = models.PositiveIntegerField(default=0)
    notes = models.TextField(blank=True, default='')

    class Meta:
        ordering = ['-issue_date']

    def save(self, *args, **kwargs):
        if not self.due_date and self.issue_date:
            self.due_date = self.issue_date + timedelta(days=14)
        super().save(*args, **kwargs)

    @property
    def is_overdue(self):
        if self.status == self.Status.ACTIVE and self.due_date:
            return timezone.now() > self.due_date
        return False

    def __str__(self):
        return f"Loan #{self.id}: {self.book.title} to {self.user.email} [{self.status}]"

class Reservation(TimeStampedModel):
    class Status(models.TextChoices):
        ACTIVE = 'ACTIVE', 'Active in Queue'
        FULFILLED = 'FULFILLED', 'Fulfilled / Loaned'
        CANCELLED = 'CANCELLED', 'Cancelled'
        EXPIRED = 'EXPIRED', 'Expired'

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='reservations')
    book = models.ForeignKey('books.Book', on_delete=models.CASCADE, related_name='reservations')
    reservation_date = models.DateTimeField(default=timezone.now)
    queue_position = models.PositiveIntegerField(default=1)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.ACTIVE, db_index=True)
    notified_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['reservation_date']
        unique_together = ('user', 'book', 'status')

    def __str__(self):
        return f"Reservation: {self.book.title} by {self.user.email} (Pos: {self.queue_position})"

class Favorite(TimeStampedModel):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='favorites')
    book = models.ForeignKey('books.Book', on_delete=models.CASCADE, related_name='favorited_by')

    class Meta:
        unique_together = ('user', 'book')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.email} favorited {self.book.title}"

class Wishlist(TimeStampedModel):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='wishlist_items')
    book = models.ForeignKey('books.Book', on_delete=models.CASCADE, related_name='wishlisted_by')
    priority = models.PositiveSmallIntegerField(default=1)

    class Meta:
        unique_together = ('user', 'book')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.email} saved {self.book.title} to wishlist"

class AuditLog(TimeStampedModel):
    actor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    action = models.CharField(max_length=100, db_index=True)
    entity_type = models.CharField(max_length=100)
    entity_id = models.CharField(max_length=100, blank=True)
    metadata = models.JSONField(default=dict, blank=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        actor_email = self.actor.email if self.actor else 'SYSTEM'
        return f"[{self.created_at}] {actor_email} -> {self.action} on {self.entity_type} #{self.entity_id}"

class SystemSetting(TimeStampedModel):
    key = models.CharField(max_length=100, unique=True, db_index=True)
    value = models.TextField()
    description = models.TextField(blank=True, default='')

    def __str__(self):
        return f"{self.key}: {self.value}"
