#!/usr/bin/env python
"""
Quick test script to verify backend API is working.
Usage: python test_api_quick.py
"""

import requests
import json

BASE_URL = 'http://127.0.0.1:8000'

def test_login():
    """Test login endpoint"""
    print("\n[TEST] Login Endpoint")
    print("-" * 50)
    
    payload = {
        'email': 'admin@example.com',
        'password': 'admin123'
    }
    
    try:
        response = requests.post(f'{BASE_URL}/api/users/login/', json=payload, timeout=5)
        print(f"Status: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        
        if response.status_code == 200:
            print("✓ Login successful!")
            return response.json().get('token')
        else:
            print("✗ Login failed")
            return None
    except Exception as e:
        print(f"✗ Error: {e}")
        return None

def test_profile(token):
    """Test get profile endpoint"""
    print("\n[TEST] Get Profile Endpoint")
    print("-" * 50)
    
    headers = {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json'
    }
    
    try:
        response = requests.get(f'{BASE_URL}/api/users/profile/', headers=headers, timeout=5)
        print(f"Status: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        
        if response.status_code == 200:
            print("✓ Profile retrieval successful!")
        else:
            print("✗ Profile retrieval failed")
    except Exception as e:
        print(f"✗ Error: {e}")

def main():
    print("CreditLine - Backend API Quick Test")
    print("=" * 50)
    
    # Test login
    token = test_login()
    
    if token:
        # Test profile if login succeeded
        test_profile(token)
    
    print("\n" + "=" * 50)
    print("Test complete!")

if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        print("\n\nTest interrupted by user")
    except Exception as e:
        print(f"\nFatal error: {e}")
