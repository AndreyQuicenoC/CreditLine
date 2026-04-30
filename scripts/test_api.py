#!/usr/bin/env python
"""
Simple API Test

Tests the login and users endpoints.
"""

import requests
import json

BASE_URL = "http://localhost:8000"

def test_login():
    print("\n" + "="*60)
    print("Testing Login Endpoint")
    print("="*60)

    credentials = {
        "email": "admin@creditline.com",
        "password": "admin123"
    }

    print(f"\nPOST {BASE_URL}/api/users/login/")
    print(f"Data: {credentials}")

    try:
        response = requests.post(
            f"{BASE_URL}/api/users/login/",
            json=credentials,
            timeout=5
        )

        print(f"Status: {response.status_code}")

        if response.status_code == 200:
            data = response.json()
            print("Response:")
            print(f"  - User: {data.get('user', {}).get('nombre')}")
            print(f"  - Email: {data.get('user', {}).get('email')}")
            print(f"  - Role: {data.get('user', {}).get('rol')}")
            token = data.get('token')
            if token:
                print(f"  - Token: {token[:50]}...")
                return token
            else:
                print("ERROR: No token in response!")
        else:
            print(f"ERROR: {response.text}")

    except Exception as e:
        print(f"ERROR: {e}")

    return None

def test_list_users(token):
    print("\n" + "="*60)
    print("Testing List Users Endpoint")
    print("="*60)

    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

    print(f"\nGET {BASE_URL}/api/users/list/")
    print(f"Headers: Authorization: Bearer {token[:20]}...")

    try:
        response = requests.get(
            f"{BASE_URL}/api/users/list/",
            headers=headers,
            timeout=5
        )

        print(f"Status: {response.status_code}")

        if response.status_code == 200:
            data = response.json()
            print(f"Response: Found {len(data)} users")
            for user in data:
                print(f"  - {user.get('nombre')} ({user.get('email')}) - {user.get('rol')}")
        else:
            print(f"ERROR: {response.text}")

    except Exception as e:
        print(f"ERROR: {e}")

if __name__ == "__main__":
    print("\nAPI Testing Started...")
    print("Make sure Django dev server is running on port 8000")

    token = test_login()

    if token:
        test_list_users(token)
        print("\n" + "="*60)
        print("Tests completed!")
        print("="*60 + "\n")
    else:
        print("\nLogin failed. Cannot proceed with further tests.")
