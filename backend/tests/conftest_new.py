"""
Pytest configuration for CreditLine backend tests.
Uses the same database as development for tests (no separate test DB to avoid encoding issues on Windows).
"""

import pytest
import os
import django
from django.conf import settings

# Configure Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'creditline.settings')
django.setup()


@pytest.fixture
def admin_user(db):
    """Create a test admin user."""
    import uuid
    from apps.users.models import UserProfile
    from django.db import connection
    
    auth_id = uuid.uuid4()
    user = UserProfile.objects.create(
        auth_id=auth_id,
        nombre='Admin Test',
        email='admin_test@creditline.local',
        rol='ADMIN',
        is_active=True
    )
    
    # Ensure mock_auth_users table exists and insert password
    try:
        with connection.cursor() as cursor:
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS mock_auth_users (
                    auth_id UUID PRIMARY KEY,
                    email VARCHAR(255) NOT NULL UNIQUE,
                    encrypted_password VARCHAR(255) NOT NULL
                );
            """)
            cursor.execute("""
                INSERT INTO mock_auth_users (auth_id, email, encrypted_password)
                VALUES (%s, %s, %s)
                ON CONFLICT (email) DO UPDATE 
                SET encrypted_password = EXCLUDED.encrypted_password;
            """, [str(auth_id), user.email, 'admin123'])
    except Exception as e:
        print(f"Warning: Could not seed mock_auth_users: {e}")
    
    return user


@pytest.fixture
def operario_user(db):
    """Create a test operario user."""
    import uuid
    from apps.users.models import UserProfile
    from django.db import connection
    
    auth_id = uuid.uuid4()
    user = UserProfile.objects.create(
        auth_id=auth_id,
        nombre='Operario Test',
        email='operario_test@creditline.local',
        rol='OPERARIO',
        is_active=True
    )
    
    # Ensure mock_auth_users table exists and insert password
    try:
        with connection.cursor() as cursor:
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS mock_auth_users (
                    auth_id UUID PRIMARY KEY,
                    email VARCHAR(255) NOT NULL UNIQUE,
                    encrypted_password VARCHAR(255) NOT NULL
                );
            """)
            cursor.execute("""
                INSERT INTO mock_auth_users (auth_id, email, encrypted_password)
                VALUES (%s, %s, %s)
                ON CONFLICT (email) DO UPDATE 
                SET encrypted_password = EXCLUDED.encrypted_password;
            """, [str(auth_id), user.email, 'operario123'])
    except Exception as e:
        print(f"Warning: Could not seed mock_auth_users: {e}")
    
    return user


@pytest.fixture
def admin_token(admin_user):
    """Generate JWT token for admin user."""
    from apps.users.views import generate_jwt_token
    return generate_jwt_token(str(admin_user.auth_id), admin_user.email)


@pytest.fixture
def operario_token(operario_user):
    """Generate JWT token for operario user."""
    from apps.users.views import generate_jwt_token
    return generate_jwt_token(str(operario_user.auth_id), operario_user.email)
