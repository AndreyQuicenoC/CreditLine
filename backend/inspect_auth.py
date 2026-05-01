#!/usr/bin/env python
import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'creditline.settings')
django.setup()
from django.db import connection

def list_auth_users():
    try:
        with connection.cursor() as cursor:
            # First inspect columns
            cursor.execute("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'mock_auth_users';")
            cols = cursor.fetchall()
            print('mock_auth_users columns:', cols)
            # Try a flexible select
            cursor.execute("SELECT * FROM mock_auth_users LIMIT 20;")
            rows = cursor.fetchall()
            if not rows:
                print('No rows in mock_auth_users')
                return 1
            for r in rows:
                print(r)
            # Check user_profiles
            print('\nQuerying user_profiles:')
            cursor.execute("SELECT auth_id, email, nombre, rol FROM user_profiles LIMIT 20;")
            upr = cursor.fetchall()
            if not upr:
                print('No rows in user_profiles')
            else:
                for u in upr:
                    print(u)
            return 0
    except Exception as e:
        import traceback
        traceback.print_exc()
        print('Error querying mock_auth_users:', e)
        return 2

if __name__ == '__main__':
    exit(list_auth_users())
