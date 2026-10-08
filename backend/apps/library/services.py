from django.db import transaction
from django.utils import timezone
from datetime import timedelta
from rest_framework.exceptions import ValidationError
from .models import InventoryItem, Loan, Reservation, Favorite, Wishlist, AuditLog
from apps.books.models import Book

class LibraryService:
    @staticmethod
    def borrow_book(user, book_id, notes=""):
        """
        Atomically issues a book to a user.
        Validates availability, allocates copy, decrements available_copies,
        sets due date to 14 days, records audit log.
        """
        with transaction.atomic():
            # Lock book record for concurrent borrow safety (Section 132-133)
            book = Book.objects.select_for_update().get(pk=book_id)

            if not book.is_active:
                raise ValidationError({"message": "This book is not currently active in the catalog."})

            if book.available_copies <= 0:
                raise ValidationError({"message": "No copies currently available. You may reserve this book instead."})

            # Check if user already has an active loan for this book
            existing_active_loan = Loan.objects.filter(
                user=user,
                book=book,
                status=Loan.Status.ACTIVE
            ).exists()
            if existing_active_loan:
                raise ValidationError({"message": "You already have an active loan for this book."})

            # Find or auto-allocate an available inventory copy
            inventory_item = InventoryItem.objects.select_for_update().filter(
                book=book,
                status=InventoryItem.Status.AVAILABLE
            ).first()

            if not inventory_item:
                # If specific copy tracking hasn't been populated yet, create copy entry
                copy_number = book.inventory_items.count() + 1
                inventory_item = InventoryItem.objects.create(
                    book=book,
                    copy_code=f"{book.id}-{copy_number:03d}",
                    status=InventoryItem.Status.BORROWED
                )
            else:
                inventory_item.status = InventoryItem.Status.BORROWED
                inventory_item.save(update_fields=['status', 'updated_at'])

            # Decrement book available copies
            book.available_copies = max(0, book.available_copies - 1)
            book.save(update_fields=['available_copies', 'updated_at'])

            # Create loan
            due_date = timezone.now() + timedelta(days=14)
            loan = Loan.objects.create(
                user=user,
                book=book,
                inventory_item=inventory_item,
                issue_date=timezone.now(),
                due_date=due_date,
                status=Loan.Status.ACTIVE,
                notes=notes
            )

            # Record audit log
            AuditLog.objects.create(
                actor=user,
                action='BORROW_BOOK',
                entity_type='Loan',
                entity_id=str(loan.id),
                metadata={'book_id': book.id, 'title': book.title, 'copy_code': inventory_item.copy_code}
            )

            # Track recommendation conversion event if applicable
            from apps.recommendations.models import RecommendationEvent
            RecommendationEvent.objects.create(
                user=user,
                book=book,
                event_type=RecommendationEvent.EventType.BORROW
            )

            return loan

    @staticmethod
    def return_book(user, loan_id):
        """
        Atomically returns a borrowed book.
        Validates loan, increments available copies, updates copy status,
        processes pending reservation queues.
        """
        with transaction.atomic():
            loan = Loan.objects.select_for_update().select_related('book', 'inventory_item').get(pk=loan_id)

            if loan.status != Loan.Status.ACTIVE and loan.status != Loan.Status.OVERDUE:
                raise ValidationError({"message": f"This loan is already marked as {loan.status}."})

            # Check permissions (only borrower or librarian/admin can return)
            if loan.user != user and not (user.is_superuser or user.role in ['ADMIN', 'LIBRARIAN']):
                raise ValidationError({"message": "You are not authorized to return this loan."})

            # Mark loan returned
            loan.status = Loan.Status.RETURNED
            loan.return_date = timezone.now()
            loan.save(update_fields=['status', 'return_date', 'updated_at'])

            # Update inventory copy
            if loan.inventory_item:
                loan.inventory_item.status = InventoryItem.Status.AVAILABLE
                loan.inventory_item.save(update_fields=['status', 'updated_at'])

            # Increment book available copies
            book = Book.objects.select_for_update().get(pk=loan.book_id)
            book.available_copies = min(book.total_copies, book.available_copies + 1)
            book.save(update_fields=['available_copies', 'updated_at'])

            # Check reservation queue
            next_reservation = Reservation.objects.filter(
                book=book,
                status=Reservation.Status.ACTIVE
            ).order_by('queue_position', 'reservation_date').first()

            if next_reservation:
                next_reservation.notified_at = timezone.now()
                next_reservation.save(update_fields=['notified_at', 'updated_at'])

            # Record audit log
            AuditLog.objects.create(
                actor=user,
                action='RETURN_BOOK',
                entity_type='Loan',
                entity_id=str(loan.id),
                metadata={'book_id': book.id, 'title': book.title}
            )

            return loan

    @staticmethod
    def renew_loan(user, loan_id):
        """
        Renews an active loan for an additional 14 days (max 2 renewals).
        """
        with transaction.atomic():
            loan = Loan.objects.select_for_update().get(pk=loan_id)

            if loan.user != user and not (user.is_superuser or user.role in ['ADMIN', 'LIBRARIAN']):
                raise ValidationError({"message": "You are not authorized to renew this loan."})

            if loan.status != Loan.Status.ACTIVE:
                raise ValidationError({"message": "Only active loans can be renewed."})

            if loan.renewal_count >= 2:
                raise ValidationError({"message": "Maximum renewals limit (2) reached for this loan."})

            loan.renewal_count += 1
            loan.due_date = loan.due_date + timedelta(days=14)
            loan.save(update_fields=['renewal_count', 'due_date', 'updated_at'])

            AuditLog.objects.create(
                actor=user,
                action='RENEW_LOAN',
                entity_type='Loan',
                entity_id=str(loan.id),
                metadata={'renewals': loan.renewal_count, 'new_due_date': str(loan.due_date)}
            )

            return loan

    @staticmethod
    def reserve_book(user, book_id):
        """
        Adds user to reservation queue for an unavailable book.
        """
        book = Book.objects.get(pk=book_id)

        if book.available_copies > 0:
            raise ValidationError({"message": "Copies are currently available for immediate borrowing. Reservation is not needed."})

        existing_res = Reservation.objects.filter(user=user, book=book, status=Reservation.Status.ACTIVE).first()
        if existing_res:
            raise ValidationError({"message": f"You already have an active reservation (position {existing_res.queue_position}) for this book."})

        current_queue_len = Reservation.objects.filter(book=book, status=Reservation.Status.ACTIVE).count()
        reservation = Reservation.objects.create(
            user=user,
            book=book,
            queue_position=current_queue_len + 1,
            status=Reservation.Status.ACTIVE
        )

        AuditLog.objects.create(
            actor=user,
            action='RESERVE_BOOK',
            entity_type='Reservation',
            entity_id=str(reservation.id),
            metadata={'book_id': book.id, 'queue_position': reservation.queue_position}
        )

        return reservation

    @staticmethod
    def toggle_favorite(user, book_id):
        book = Book.objects.get(pk=book_id)
        fav = Favorite.objects.filter(user=user, book=book).first()
        from apps.recommendations.models import RecommendationEvent
        if fav:
            fav.delete()
            return {'favorited': False, 'message': f"Removed '{book.title}' from favorites."}
        else:
            Favorite.objects.create(user=user, book=book)
            RecommendationEvent.objects.create(
                user=user, book=book, event_type=RecommendationEvent.EventType.FAVORITE
            )
            return {'favorited': True, 'message': f"Added '{book.title}' to favorites."}

    @staticmethod
    def toggle_wishlist(user, book_id):
        book = Book.objects.get(pk=book_id)
        item = Wishlist.objects.filter(user=user, book=book).first()
        from apps.recommendations.models import RecommendationEvent
        if item:
            item.delete()
            return {'wishlisted': False, 'message': f"Removed '{book.title}' from wishlist."}
        else:
            Wishlist.objects.create(user=user, book=book)
            RecommendationEvent.objects.create(
                user=user, book=book, event_type=RecommendationEvent.EventType.WISHLIST
            )
            return {'wishlisted': True, 'message': f"Saved '{book.title}' to your wishlist."}
