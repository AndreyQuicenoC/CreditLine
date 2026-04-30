from django.contrib import admin
from apps.users.models import UserProfile


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ['nombre', 'email', 'rol', 'is_active', 'ultimo_acceso', 'created_at']
    list_filter = ['rol', 'is_active', 'created_at']
    search_fields = ['nombre', 'email']
    readonly_fields = ['id', 'auth_id', 'created_at', 'updated_at']

    fieldsets = (
        ('User Identification', {
            'fields': ('id', 'auth_id', 'email'),
        }),
        ('Profile Information', {
            'fields': ('nombre', 'rol', 'is_active'),
        }),
        ('Timestamps', {
            'fields': ('ultimo_acceso', 'created_at', 'updated_at'),
        }),
    )

    def has_delete_permission(self, request, obj=None):
        """Only superusers can delete users."""
        return request.user.is_superuser
