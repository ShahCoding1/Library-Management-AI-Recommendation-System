from rest_framework import permissions

class IsAdminRole(permissions.BasePermission):
    """
    Allows access only to users with role == 'ADMIN' or is_superuser.
    """
    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        return request.user.is_superuser or request.user.role == 'ADMIN'

class IsLibrarianOrAdmin(permissions.BasePermission):
    """
    Allows access to users with role in ('LIBRARIAN', 'ADMIN') or is_staff/is_superuser.
    """
    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        return (
            request.user.is_superuser or
            request.user.is_staff or
            request.user.role in ('LIBRARIAN', 'ADMIN')
        )

class IsReaderOrReadOnly(permissions.BasePermission):
    """
    Safe methods allowed to all. Write methods require authenticated user.
    """
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and request.user.is_authenticated

class IsOwnerOrLibrarianOrAdmin(permissions.BasePermission):
    """
    Allows access to object owners or library staff/admins.
    """
    def has_object_permission(self, request, view, obj):
        if not (request.user and request.user.is_authenticated):
            return False
        if request.user.is_superuser or request.user.role in ('LIBRARIAN', 'ADMIN'):
            return True
        user_field = getattr(obj, 'user', None)
        return user_field == request.user
