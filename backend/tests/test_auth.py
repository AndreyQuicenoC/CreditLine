"""
Test authentication endpoints.
"""

import pytest
from django.test import Client
from rest_framework.test import APIClient
from apps.users.models import UserProfile
import json


@pytest.mark.django_db
class TestAuthentication:
    """Test authentication functionality."""
    
    def setup_method(self):
        """Setup test client."""
        self.client = APIClient()
    
    def test_login_success(self):
        """Test successful login with valid credentials."""
        response = self.client.post(
            '/api/users/login/',
            {'email': 'admin@example.com', 'password': 'admin123'},
            format='json'
        )
        
        assert response.status_code == 200
        data = response.json()
        assert 'token' in data
        assert 'user' in data
        assert data['user']['email'] == 'admin@example.com'
        assert data['user']['rol'] == 'ADMIN'
    
    def test_login_invalid_email(self):
        """Test login with invalid email."""
        response = self.client.post(
            '/api/users/login/',
            {'email': 'nonexistent@example.com', 'password': 'admin123'},
            format='json'
        )
        
        assert response.status_code == 401
        data = response.json()
        assert 'error' in data
    
    def test_login_invalid_password(self):
        """Test login with invalid password."""
        response = self.client.post(
            '/api/users/login/',
            {'email': 'admin@example.com', 'password': 'wrongpassword'},
            format='json'
        )
        
        assert response.status_code == 401
        data = response.json()
        assert 'error' in data
    
    def test_login_missing_fields(self):
        """Test login with missing fields."""
        response = self.client.post(
            '/api/users/login/',
            {'email': 'admin@example.com'},
            format='json'
        )
        
        assert response.status_code == 400
        data = response.json()
        assert 'error' in data
    
    def test_get_profile_authenticated(self, admin_token, admin_user):
        """Test getting profile while authenticated."""
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {admin_token}')
        
        response = self.client.get('/api/users/profile/')
        
        assert response.status_code == 200
        data = response.json()
        assert data['email'] == admin_user.email
        assert data['rol'] == 'ADMIN'
    
    def test_get_profile_unauthenticated(self):
        """Test getting profile without authentication."""
        response = self.client.get('/api/users/profile/')
        
        assert response.status_code == 401
    
    def test_update_profile(self, admin_token, admin_user):
        """Test updating user profile."""
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {admin_token}')
        
        response = self.client.put(
            '/api/users/profile/update/',
            {'nombre': 'Updated Admin Name'},
            format='json'
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data['nombre'] == 'Updated Admin Name'
        
        # Verify in database
        admin_user.refresh_from_db()
        assert admin_user.nombre == 'Updated Admin Name'
