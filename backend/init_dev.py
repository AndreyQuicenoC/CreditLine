#!/usr/bin/env python
"""
Initialize development data directly.
Run from backend directory: python init_dev.py
"""

import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'creditline.settings')
django.setup()

from django.db import connection
from apps.users.models import UserProfile
import uuid

def initialize_data():
    print("Initializing development data...")
    
    try:
        with connection.cursor() as cursor:
            # Create mock_auth_users table if not exists
            print("  Creating mock_auth_users table...")
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS mock_auth_users (
                    auth_id UUID PRIMARY KEY,
                    email VARCHAR(255) NOT NULL UNIQUE,
                    encrypted_password VARCHAR(255) NOT NULL
                );
            """)

            # Clear existing test data
            print("  Clearing existing test data...")
            cursor.execute("DELETE FROM mock_auth_users WHERE email IN (%s, %s);", 
                          ['admin@example.com', 'operario@example.com'])

            # Insert test users
            print("  Creating test users...")
            admin_id = str(uuid.uuid4())
            operario_id = str(uuid.uuid4())
            
            cursor.execute("""
                INSERT INTO mock_auth_users (auth_id, email, encrypted_password)
                VALUES (%s, %s, %s);
            """, [admin_id, 'admin@example.com', 'admin123'])

            cursor.execute("""
                INSERT INTO mock_auth_users (auth_id, email, encrypted_password)
                VALUES (%s, %s, %s);
            """, [operario_id, 'operario@example.com', 'operario123'])

        # Create UserProfile entries
        print("  Creating user profiles...")
        admin_profile, _ = UserProfile.objects.update_or_create(
            email='admin@example.com',
            defaults={
                'auth_id': admin_id,
                'nombre': 'Admin Test',
                'rol': 'ADMIN',
                'is_active': True
            }
        )

        operario_profile, _ = UserProfile.objects.update_or_create(
            email='operario@example.com',
            defaults={
                'auth_id': operario_id,
                'nombre': 'Operario Test',
                'rol': 'OPERARIO',
                'is_active': True
            }
        )

        print("\n✓ Development data initialized successfully!")
        print("\nTest credentials:")
        print("  Admin:    admin@example.com / admin123")
        print("  Operario: operario@example.com / operario123")
        return True

    except Exception as e:
        print(f"\n✗ Error initializing data: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == '__main__':
    success = initialize_data()
    sys.exit(0 if success else 1)
