"""
Initialize development/test data in the database.
This is a convenience endpoint for local development only.

Usage:
  - Direct: POST /api/users/init-dev-data/
  - CLI: python manage.py init_dev_data_direct
"""

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.db import connection
import uuid

@api_view(['POST'])
@permission_classes([AllowAny])
def init_dev_data(request):
    """
    Initialize development data for testing.
    WARNING: Only use in development! Dangerous in production.
    """
    try:
        with connection.cursor() as cursor:
            # Create mock_auth_users table if not exists
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS mock_auth_users (
                    auth_id UUID PRIMARY KEY,
                    email VARCHAR(255) NOT NULL UNIQUE,
                    encrypted_password VARCHAR(255) NOT NULL
                );
            """)

            # Clear existing test data
            cursor.execute("DELETE FROM mock_auth_users WHERE email IN (%s, %s);", 
                          ['admin@example.com', 'operario@example.com'])

            # Insert test users
            admin_id = uuid.uuid4()
            operario_id = uuid.uuid4()
            
            cursor.execute("""
                INSERT INTO mock_auth_users (auth_id, email, encrypted_password)
                VALUES (%s, %s, %s);
            """, [str(admin_id), 'admin@example.com', 'admin123'])

            cursor.execute("""
                INSERT INTO mock_auth_users (auth_id, email, encrypted_password)
                VALUES (%s, %s, %s);
            """, [str(operario_id), 'operario@example.com', 'operario123'])

        # Create UserProfile entries
        from apps.users.models import UserProfile
        
        UserProfile.objects.update_or_create(
            email='admin@example.com',
            defaults={
                'auth_id': admin_id,
                'nombre': 'Admin Test',
                'rol': 'ADMIN',
                'is_active': True
            }
        )

        UserProfile.objects.update_or_create(
            email='operario@example.com',
            defaults={
                'auth_id': operario_id,
                'nombre': 'Operario Test',
                'rol': 'OPERARIO',
                'is_active': True
            }
        )

        return Response({
            'message': 'Development data initialized successfully',
            'users': [
                {'email': 'admin@example.com', 'password': 'admin123', 'role': 'ADMIN'},
                {'email': 'operario@example.com', 'password': 'operario123', 'role': 'OPERARIO'},
            ]
        }, status=status.HTTP_200_OK)

    except Exception as e:
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Error initializing dev data: {str(e)}")
        return Response({
            'error': f'Failed to initialize data: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
