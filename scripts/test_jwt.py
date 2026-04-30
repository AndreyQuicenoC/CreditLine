#!/usr/bin/env python
"""
JWT Token Testing Script

Tests JWT token generation and validation.
Run from backend directory: python -m scripts.test_jwt
"""

import os
import sys
import django
import jwt
from datetime import datetime, timedelta

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'creditline.settings')
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
django.setup()

from django.conf import settings
from django.utils import timezone

def test_token_generation():
    print("\n" + "="*60)
    print("JWT Token Testing")
    print("="*60)

    # Test 1: Check SECRET_KEY
    print("\n[TEST 1] Verify SECRET_KEY")
    print(f"SECRET_KEY: {settings.SECRET_KEY[:20]}...")
    print(f"✓ SECRET_KEY loaded successfully")

    # Test 2: Generate a token
    print("\n[TEST 2] Generate JWT Token")
    user_id = "test-user-123"
    email = "admin@example.com"

    payload = {
        'sub': user_id,
        'email': email,
        'iat': int(timezone.now().timestamp()),
        'exp': int((timezone.now() + timedelta(hours=1)).timestamp()),
    }

    print(f"Payload: {payload}")
    token = jwt.encode(payload, settings.SECRET_KEY, algorithm='HS256')
    print(f"✓ Token generated: {token[:50]}...")

    # Test 3: Decode the token
    print("\n[TEST 3] Decode JWT Token")
    try:
        decoded = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=["HS256"]
        )
        print(f"✓ Decoded successfully: {decoded}")
    except Exception as e:
        print(f"✗ Decode failed: {e}")
        return False

    # Test 4: Verify expiration works
    print("\n[TEST 4] Test Token Expiration")
    expired_payload = {
        'sub': user_id,
        'email': email,
        'iat': int((timezone.now() - timedelta(hours=2)).timestamp()),
        'exp': int((timezone.now() - timedelta(hours=1)).timestamp()),
    }
    expired_token = jwt.encode(expired_payload, settings.SECRET_KEY, algorithm='HS256')

    try:
        jwt.decode(
            expired_token,
            settings.SECRET_KEY,
            algorithms=["HS256"]
        )
        print("✗ Expired token was not rejected!")
        return False
    except jwt.ExpiredSignatureError:
        print("✓ Expired token correctly rejected")
    except Exception as e:
        print(f"✗ Unexpected error: {e}")
        return False

    # Test 5: Verify wrong secret fails
    print("\n[TEST 5] Test Wrong Secret Key")
    wrong_secret = "wrong-secret-key"
    try:
        jwt.decode(
            token,
            wrong_secret,
            algorithms=["HS256"]
        )
        print("✗ Token was decoded with wrong secret!")
        return False
    except jwt.DecodeError:
        print("✓ Wrong secret correctly rejected")
    except Exception as e:
        print(f"✗ Unexpected error: {e}")
        return False

    print("\n" + "="*60)
    print("✓ All JWT tests passed!")
    print("="*60 + "\n")
    return True

def test_database_connection():
    print("\n" + "="*60)
    print("Database Connection Testing")
    print("="*60)

    try:
        from apps.users.models import UserProfile

        print("\n[TEST 1] Check database connection")
        count = UserProfile.objects.count()
        print(f"✓ Database connected. Found {count} users")

        print("\n[TEST 2] Verify user_profiles table exists")
        admin_users = UserProfile.objects.filter(rol='ADMIN')
        print(f"✓ Found {admin_users.count()} admin users")

        for user in admin_users[:3]:
            print(f"  - {user.nombre} ({user.email})")

        return True
    except Exception as e:
        print(f"✗ Database error: {e}")
        return False

if __name__ == "__main__":
    try:
        jwt_ok = test_token_generation()
        db_ok = test_database_connection()

        if jwt_ok and db_ok:
            print("\n✓ All tests passed!")
            sys.exit(0)
        else:
            print("\n✗ Some tests failed")
            sys.exit(1)
    except Exception as e:
        print(f"\n✗ Fatal error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
