"""
Pytest configuration and fixtures for CreditLine backend tests.
"""

import pytest
import os
import django
from django.conf import settings
from django.test.utils import get_unique_databases_and_mirrors
from django.db import connection
from apps.users.models import UserProfile
import uuid
import json

# Configure Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'creditline.settings')
django.setup()


@pytest.fixture(scope='session')
def django_db_setup():
    """Configure test database."""
    settings.DATABASES['default'] = {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'creditline_test',
        'USER': os.getenv('DB_USER', 'postgres'),
        'PASSWORD': os.getenv('DB_PASSWORD', 'postgres'),
        'HOST': os.getenv('DB_HOST', 'localhost'),
        'PORT': os.getenv('DB_PORT', '5432'),
        'ATOMIC_REQUESTS': False,
    }



@pytest.fixture(scope='function', autouse=True)
def seed_test_users(db):
    """Seed a couple of users and auth records used by tests."""
    import uuid
    from django.db import connection as _connection

    # Ensure auth table and seed two users
    with _connection.cursor() as cursor:
        cursor.execute("DROP TABLE IF EXISTS mock_auth_users CASCADE;")
        cursor.execute(
            """
            CREATE TABLE mock_auth_users (
                auth_id uuid PRIMARY KEY,
                email text UNIQUE,
                encrypted_password text
            );
            """
        )

        # Insert admin@example.com
        admin_id = uuid.uuid4()
        cursor.execute("INSERT INTO mock_auth_users (auth_id, email, encrypted_password) VALUES (%s, %s, %s);", [str(admin_id), 'admin@example.com', 'admin123'])
        # Insert operario@example.com
        operario_id = uuid.uuid4()
        cursor.execute("INSERT INTO mock_auth_users (auth_id, email, encrypted_password) VALUES (%s, %s, %s);", [str(operario_id), 'operario@example.com', 'operario123'])

    # Ensure matching UserProfile rows
    from apps.users.models import UserProfile
    UserProfile.objects.update_or_create(email='admin@example.com', defaults={'auth_id': admin_id, 'nombre': 'Admin Test', 'rol': 'ADMIN', 'is_active': True})
    UserProfile.objects.update_or_create(email='operario@example.com', defaults={'auth_id': operario_id, 'nombre': 'Operario Test', 'rol': 'OPERARIO', 'is_active': True})
    yield





@pytest.fixture
def admin_user(db):
    """Create a test admin user."""
    auth_id = uuid.uuid4()
    user = UserProfile.objects.create(
        auth_id=auth_id,
        nombre='Admin Test',
        email='admin@example.com',
        rol='ADMIN',
        is_active=True
    )
    
    # Store password in mock_auth_users
    create_sql = """
    DROP TABLE IF EXISTS mock_auth_users CASCADE;
    CREATE TABLE mock_auth_users (
        auth_id uuid PRIMARY KEY,
        email text UNIQUE,
        encrypted_password text
    );
    """
    with connection.cursor() as cursor:
        cursor.execute(create_sql)
        cursor.execute(
            "DELETE FROM mock_auth_users WHERE email = %s;",
            ['admin@example.com']
        )
        cursor.execute(
            """
            INSERT INTO mock_auth_users (auth_id, email, encrypted_password)
            VALUES (%s, %s, %s);
            """,
            [str(auth_id), 'admin@example.com', 'admin123']
        )
    
    return user


@pytest.fixture
def operario_user(db):
    """Create a test operario user."""
    auth_id = uuid.uuid4()
    user = UserProfile.objects.create(
        auth_id=auth_id,
        nombre='Operario Test',
        email='operario@example.com',
        rol='OPERARIO',
        is_active=True
    )
    
    # Store password in mock_auth_users
    create_sql = """
    DROP TABLE IF EXISTS mock_auth_users CASCADE;
    CREATE TABLE mock_auth_users (
        auth_id uuid PRIMARY KEY,
        email text UNIQUE,
        encrypted_password text
    );
    """
    with connection.cursor() as cursor:
        cursor.execute(create_sql)
        cursor.execute(
            "DELETE FROM mock_auth_users WHERE email = %s;",
            ['operario@example.com']
        )
        cursor.execute(
            """
            INSERT INTO mock_auth_users (auth_id, email, encrypted_password)
            VALUES (%s, %s, %s);
            """,
            [str(auth_id), 'operario@example.com', 'operario123']
        )
    
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
