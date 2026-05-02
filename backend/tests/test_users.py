"""
Test user management endpoints.
"""

import pytest
from rest_framework.test import APIClient
from apps.users.models import UserProfile
import uuid


@pytest.mark.django_db
class TestUserManagement:
    """Test user CRUD operations."""
    
    def setup_method(self):
        """Setup test client."""
        self.client = APIClient()
    
    def test_list_users_admin(self, admin_token):
        """Test listing users as admin."""
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {admin_token}')
        
        response = self.client.get('/api/users/list/')
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0
    
    def test_list_users_operario_forbidden(self, operario_token):
        """Test that operario cannot list users."""
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {operario_token}')
        
        response = self.client.get('/api/users/list/')
        
        assert response.status_code == 403
        data = response.json()
        assert 'error' in data
    
    def test_create_user_admin(self, admin_token, db):
        """Test creating a new user as admin."""
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {admin_token}')
        
        response = self.client.post(
            '/api/users/create/',
            {
                'nombre': 'New User',
                'email': 'newuser@test.com',
                'rol': 'OPERARIO',
                'password': 'password123'
            },
            format='json'
        )
        
        assert response.status_code == 201
        data = response.json()
        assert 'user' in data
        assert data['user']['email'] == 'newuser@test.com'
        assert data['user']['rol'] == 'OPERARIO'
        
        # Verify user was created in database
        user = UserProfile.objects.get(email='newuser@test.com')
        assert user.nombre == 'New User'
    
    def test_create_user_duplicate_email(self, admin_token, operario_user):
        """Test that duplicate emails are rejected."""
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {admin_token}')
        
        response = self.client.post(
            '/api/users/create/',
            {
                'nombre': 'Duplicate',
                'email': operario_user.email,
                'rol': 'OPERARIO',
                'password': 'password123'
            },
            format='json'
        )
        
        assert response.status_code == 400
        data = response.json()
        assert 'email' in data
    
    def test_create_user_invalid_password(self, admin_token):
        """Test that short passwords are rejected."""
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {admin_token}')
        
        response = self.client.post(
            '/api/users/create/',
            {
                'nombre': 'Test User',
                'email': 'test@test.com',
                'rol': 'OPERARIO',
                'password': 'short'
            },
            format='json'
        )
        
        assert response.status_code == 400
        data = response.json()
        assert 'password' in data
    
    def test_edit_user_admin(self, admin_token, operario_user):
        """Test editing a user as admin."""
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {admin_token}')
        
        response = self.client.put(
            f'/api/users/{operario_user.auth_id}/edit/',
            {
                'nombre': 'Updated Operario',
                'rol': 'ADMIN'
            },
            format='json'
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data['nombre'] == 'Updated Operario'
        assert data['rol'] == 'ADMIN'
        
        # Verify in database
        operario_user.refresh_from_db()
        assert operario_user.nombre == 'Updated Operario'
        assert operario_user.rol == 'ADMIN'
    
    def test_delete_user_admin(self, admin_token, operario_user):
        """Test deleting a user as admin."""
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {admin_token}')
        
        user_id = operario_user.auth_id
        
        response = self.client.delete(
            f'/api/users/{user_id}/delete/'
        )
        
        assert response.status_code == 200
        
        # Verify user was deleted
        with pytest.raises(UserProfile.DoesNotExist):
            UserProfile.objects.get(auth_id=user_id)
    
    def test_delete_own_account_forbidden(self, admin_token, admin_user):
        """Test that admin cannot delete their own account."""
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {admin_token}')
        
        response = self.client.delete(
            f'/api/users/{admin_user.auth_id}/delete/'
        )
        
        assert response.status_code == 400
        data = response.json()
        assert 'error' in data
        
        # Verify user still exists
        admin_user.refresh_from_db()
        assert admin_user.is_active
