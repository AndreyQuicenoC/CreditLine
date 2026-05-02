#!/usr/bin/env python
"""Fix mock_auth_users schema - rename id to auth_id"""
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'creditline.settings')
sys.path.insert(0, os.path.dirname(__file__))
django.setup()

from django.db import connection

def fix_schema():
    """Fix the mock_auth_users table schema"""
    with connection.cursor() as cursor:
        print("\n=== Fixing mock_auth_users schema ===")
        
        try:
            # Rename id column to auth_id
            print("Renaming 'id' column to 'auth_id'...")
            cursor.execute("ALTER TABLE mock_auth_users RENAME COLUMN id TO auth_id;")
            print("✓ Column renamed successfully")
            
            # Verify the change
            print("\nVerifying schema after rename...")
            cursor.execute("""
                SELECT column_name, data_type 
                FROM information_schema.columns 
                WHERE table_name = 'mock_auth_users'
                ORDER BY ordinal_position;
            """)
            columns = cursor.fetchall()
            print("✓ Table 'mock_auth_users' now has columns:")
            for col_name, col_type in columns:
                print(f"  - {col_name}: {col_type}")
            
            # Test INSERT
            print("\n=== Testing INSERT with new schema ===")
            import uuid
            test_id = str(uuid.uuid4())
            cursor.execute(
                "INSERT INTO mock_auth_users (auth_id, email, encrypted_password) VALUES (%s, %s, %s) ON CONFLICT DO NOTHING;",
                [test_id, f'test_{test_id[:8]}@test.com', 'testpass123']
            )
            print(f"✓ Successfully inserted test record with auth_id")
            
            # Clean up
            cursor.execute("DELETE FROM mock_auth_users WHERE auth_id = %s;", [test_id])
            print("✓ Cleaned up test record")
            print("\n✅ Schema fix completed successfully!")
            
        except Exception as e:
            print(f"✗ Error: {e}")
            import traceback
            traceback.print_exc()
            return False
    
    return True

if __name__ == '__main__':
    if fix_schema():
        sys.exit(0)
    else:
        sys.exit(1)
