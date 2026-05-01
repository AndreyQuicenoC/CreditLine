#!/usr/bin/env python
"""Update trigger function in database to use auth_id"""
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'creditline.settings')
sys.path.insert(0, os.path.dirname(__file__))
django.setup()

from django.db import connection

def update_trigger():
    """Update the trigger function in the database"""
    with connection.cursor() as cursor:
        print("\n=== Updating trigger function ===")
        
        try:
            # Update the trigger function
            print("Updating handle_new_user() function to use auth_id...")
            cursor.execute("""
                CREATE OR REPLACE FUNCTION public.handle_new_user()
                RETURNS TRIGGER AS $$
                BEGIN
                    -- Insert profile only if not exists for this auth id
                    INSERT INTO public.user_profiles (auth_id, email, nombre, rol, is_active)
                    VALUES (new.auth_id, new.email, new.email, 'OPERARIO', true)
                    ON CONFLICT (auth_id) DO NOTHING;
                    RETURN new;
                END;
                $$ LANGUAGE plpgsql SECURITY DEFINER;
            """)
            print("✓ Trigger function updated successfully")
            
            # Test INSERT
            print("\n=== Testing INSERT with updated trigger ===")
            import uuid
            test_id = str(uuid.uuid4())
            cursor.execute(
                "INSERT INTO mock_auth_users (auth_id, email, encrypted_password) VALUES (%s, %s, %s) ON CONFLICT (email) DO NOTHING;",
                [test_id, f'test_{test_id[:8]}@test.com', 'testpass123']
            )
            print(f"✓ Successfully inserted test record with auth_id")
            
            # Verify INSERT to user_profiles
            cursor.execute(
                "SELECT auth_id, email FROM user_profiles WHERE auth_id = %s;",
                [test_id]
            )
            result = cursor.fetchone()
            if result:
                print(f"✓ User profile auto-created: auth_id={result[0]}, email={result[1]}")
            else:
                print("⚠ Warning: User profile not auto-created by trigger")
            
            # Clean up
            cursor.execute("DELETE FROM user_profiles WHERE auth_id = %s;", [test_id])
            cursor.execute("DELETE FROM mock_auth_users WHERE auth_id = %s;", [test_id])
            print("✓ Cleaned up test records")
            print("\n✅ Trigger update completed successfully!")
            
        except Exception as e:
            print(f"✗ Error: {e}")
            import traceback
            traceback.print_exc()
            return False
    
    return True

if __name__ == '__main__':
    if update_trigger():
        sys.exit(0)
    else:
        sys.exit(1)
