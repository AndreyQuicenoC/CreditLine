import uuid
from django.db import models
from django.contrib.auth.models import User
from django.core.validators import EmailValidator
from django.utils.translation import gettext_lazy as _


class UserProfile(models.Model):
    """
    User profile model - extends Supabase auth.users with custom fields.

    This model stores user metadata like nombre (name) and rol (role).
    Authentication is handled by Supabase Auth, not Django's built-in auth.
    """

    ROLE_CHOICES = [
        ('ADMIN', 'Administrador'),
        ('OPERARIO', 'Operario'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    auth_id = models.UUIDField(unique=True, db_index=True, help_text="Reference to Supabase auth.users.id")
    email = models.EmailField(unique=True, validators=[EmailValidator()])
    nombre = models.CharField(max_length=255, help_text="Full name of the user")
    rol = models.CharField(
        max_length=50,
        choices=ROLE_CHOICES,
        default='OPERARIO',
        help_text="User role: ADMIN or OPERARIO"
    )
    is_active = models.BooleanField(default=True, help_text="Whether the user account is active")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    ultimo_acceso = models.DateTimeField(null=True, blank=True, help_text="Last login timestamp")

    class Meta:
        ordering = ['-created_at']
        verbose_name = _('User Profile')
        verbose_name_plural = _('User Profiles')
        indexes = [
            models.Index(fields=['auth_id']),
            models.Index(fields=['email']),
            models.Index(fields=['rol']),
        ]

    def __str__(self):
        return f"{self.nombre} ({self.get_rol_display()})"

    def update_last_access(self):
        """Update the last access timestamp."""
        from django.utils import timezone
        self.ultimo_acceso = timezone.now()
        self.save(update_fields=['ultimo_acceso'])

    @property
    def is_admin(self):
        """Check if user is admin."""
        return self.rol == 'ADMIN'

    @property
    def is_operario(self):
        """Check if user is operator."""
        return self.rol == 'OPERARIO'
