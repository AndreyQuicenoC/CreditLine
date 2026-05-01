#!/usr/bin/env python
import os
import sys
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'creditline.settings')
django.setup()

from django.db import connections

def check_connection():
    try:
        with connections['default'].cursor() as cursor:
            cursor.execute('SELECT 1;')
            row = cursor.fetchone()
            print('DB connection OK, result:', row)
            return 0
    except Exception as e:
        import traceback
        traceback.print_exc()
        print('DB connection failed:', str(e))
        return 1

if __name__ == '__main__':
    sys.exit(check_connection())
