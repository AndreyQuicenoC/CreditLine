#!/usr/bin/env python
import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'creditline.settings')
django.setup()
from django.test import Client
import json

def test_login(email, password):
    client = Client()
    resp = client.post('/api/users/login/', data=json.dumps({'email': email, 'password': password}), content_type='application/json')
    print('Status:', resp.status_code)
    try:
        print('JSON:', resp.json())
    except Exception:
        print('Content:', resp.content)

if __name__ == '__main__':
    test_login('admin@creditline.com', 'admin123')
    test_login('operario@creditline.com', 'operario123')