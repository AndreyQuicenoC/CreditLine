#!/usr/bin/env python
"""Verify database schema and table structure"""
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'creditline.settings')
sys.path.insert(0, os.path.dirname(__file__))
django.setup()

from django.db import connection

def check_schema():
    """Check if tables exist and have correct columns"""
    with connection.cursor() as cursor:
        # Check if mock_auth_users table exists
        print("\n=== Checking mock_auth_users table ===")
        try:
            cursor.execute("""
                SELECT column_name, data_type 
                FROM information_schema.columns 
                WHERE table_name = 'mock_auth_users'
                ORDER BY ordinal_position;
            """)
            columns = cursor.fetchall()
            if columns:
                print("✓ Table 'mock_auth_users' exists with columns:")
                for col_name, col_type in columns:
                    print(f"  - {col_name}: {col_type}")
            else:
                print("✗ Table 'mock_auth_users' does NOT exist")
        except Exception as e:
            print(f"✗ Error checking table: {e}")
        
        # Check if user_profiles table exists
        print("\n=== Checking user_profiles table ===")
        try:
            cursor.execute("""
                SELECT column_name, data_type 
                FROM information_schema.columns 
                WHERE table_name = 'user_profiles'
                ORDER BY ordinal_position;
            """)
            columns = cursor.fetchall()
            if columns:
                print("✓ Table 'user_profiles' exists with columns:")
                for col_name, col_type in columns:
                    print(f"  - {col_name}: {col_type}")
            else:
                print("✗ Table 'user_profiles' does NOT exist")
        except Exception as e:
            print(f"✗ Error checking table: {e}")
        
        # Try to insert a test record
        print("\n=== Testing INSERT into mock_auth_users ===")
        try:
            import uuid
            test_id = str(uuid.uuid4())
            cursor.execute(
                "INSERT INTO mock_auth_users (auth_id, email, encrypted_password) VALUES (%s, %s, %s) ON CONFLICT DO NOTHING;",
                [test_id, f'test_{test_id[:8]}@test.com', 'testpass123']
            )
            print(f"✓ Successfully inserted test record")
            
            # Clean up
            cursor.execute("DELETE FROM mock_auth_users WHERE auth_id = %s;", [test_id])
            print("✓ Cleaned up test record")
        except Exception as e:
            print(f"✗ Error inserting: {e}")
            import traceback
            traceback.print_exc()

if __name__ == '__main__':
    check_schema()
