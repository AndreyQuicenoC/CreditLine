from rest_framework import serializers
from apps.users.models import UserProfile


class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer for UserProfile model. Excludes sensitive data."""

    class Meta:
        model = UserProfile
        fields = [
            'id',
            'auth_id',
            'email',
            'nombre',
            'rol',
            'is_active',
            'ultimo_acceso',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'auth_id', 'created_at', 'updated_at']

    def validate_nombre(self, value):
        """Validate that nombre is not empty."""
        if not value or not value.strip():
            raise serializers.ValidationError("Nombre cannot be empty.")
        return value.strip()

    def validate_rol(self, value):
        """Validate that rol is one of the allowed choices."""
        if value not in ['ADMIN', 'OPERARIO']:
            raise serializers.ValidationError("Rol must be ADMIN or OPERARIO.")
        return value


class UserLoginResponseSerializer(serializers.Serializer):
    """Response serializer for login endpoint. Returns user profile after auth."""

    user = UserProfileSerializer(read_only=True)
    message = serializers.CharField(read_only=True)

    class Meta:
        fields = ['user', 'message']
