import pytest
import json
import jwt
from django.utils import timezone
from django.conf import settings
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from apps.users.models import UserProfile
import uuid


class UserAuthenticationTests(APITestCase):
    """Tests for user authentication endpoints."""

    def setUp(self):
        """Set up test client and fixtures."""
        self.client = APIClient()
        self.base_url = '/api/users'

        # Create test admin user
        self.admin_id = uuid.uuid4()
        self.admin = UserProfile.objects.create(
            auth_id=self.admin_id,
            email='admin@test.com',
            nombre='Admin Test',
            rol='ADMIN',
            is_active=True
        )

        # Create test operator user
        self.operator_id = uuid.uuid4()
        self.operator = UserProfile.objects.create(
            auth_id=self.operator_id,
            email='operator@test.com',
            nombre='Operator Test',
            rol='OPERARIO',
            is_active=True
        )

        # Generate test JWT tokens
        self.admin_token = self._generate_token(self.admin_id, 'admin@test.com')
        self.operator_token = self._generate_token(self.operator_id, 'operator@test.com')

    def _generate_token(self, user_id, email):
        """Generate a JWT token for testing."""
        payload = {
            'sub': str(user_id),
            'email': email,
            'iat': int(timezone.now().timestamp()),
            'exp': int((timezone.now() + timezone.timedelta(hours=1)).timestamp()),
        }
        return jwt.encode(payload, settings.SECRET_KEY, algorithm='HS256')

    def test_get_profile(self):
        """Test get profile endpoint."""
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.admin_token}')
        response = self.client.get(f'{self.base_url}/profile/')
        print(f"Response status: {response.status_code}, data: {response.data}")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['email'], 'admin@test.com')

    def test_get_profile_without_auth(self):
        """Test get profile without authentication."""
        response = self.client.get(f'{self.base_url}/profile/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_update_profile(self):
        """Test update profile endpoint."""
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.admin_token}')
        response = self.client.put(f'{self.base_url}/profile/update/', {
            'nombre': 'Updated Admin'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.admin.refresh_from_db()
        self.assertEqual(self.admin.nombre, 'Updated Admin')


class UserManagementTests(APITestCase):
    """Tests for user management endpoints (admin only)."""

    def setUp(self):
        """Set up test client and fixtures."""
        self.client = APIClient()
        self.base_url = '/api/users'

        # Create admin user
        self.admin_id = uuid.uuid4()
        self.admin = UserProfile.objects.create(
            auth_id=self.admin_id,
            email='admin@test.com',
            nombre='Admin Test',
            rol='ADMIN',
            is_active=True
        )
        self.admin_token = self._generate_token(self.admin_id, 'admin@test.com')

        # Create operator user
        self.operator_id = uuid.uuid4()
        self.operator = UserProfile.objects.create(
            auth_id=self.operator_id,
            email='operator@test.com',
            nombre='Operator Test',
            rol='OPERARIO',
            is_active=True
        )
        self.operator_token = self._generate_token(self.operator_id, 'operator@test.com')

    def _generate_token(self, user_id, email):
        """Generate a JWT token for testing."""
        payload = {
            'sub': str(user_id),
            'email': email,
            'iat': int(timezone.now().timestamp()),
            'exp': int((timezone.now() + timezone.timedelta(hours=1)).timestamp()),
        }
        return jwt.encode(payload, settings.SECRET_KEY, algorithm='HS256')

    def test_list_users_as_admin(self):
        """Test list users as admin."""
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.admin_token}')
        response = self.client.get(f'{self.base_url}/list/')
        print(f"Response: {response.status_code}, {response.data}")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsInstance(response.data, list)
        self.assertGreaterEqual(len(response.data), 2)

    def test_list_users_as_operator(self):
        """Test list users as operator (should fail)."""
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.operator_token}')
        response = self.client.get(f'{self.base_url}/list/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_list_users_without_auth(self):
        """Test list users without authentication."""
        response = self.client.get(f'{self.base_url}/list/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_create_user_as_admin(self):
        """Test create user as admin."""
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.admin_token}')
        response = self.client.post(f'{self.base_url}/create/', {
            'nombre': 'New User',
            'email': 'newuser@test.com',
            'rol': 'OPERARIO',
            'password': 'password123'
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('user', response.data)

    def test_create_user_as_operator(self):
        """Test create user as operator (should fail)."""
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.operator_token}')
        response = self.client.post(f'{self.base_url}/create/', {
            'nombre': 'New User',
            'email': 'newuser@test.com',
            'rol': 'OPERARIO',
            'password': 'password123'
        })
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_delete_user_as_admin(self):
        """Test delete user as admin."""
        # Create a user to delete
        user_to_delete = UserProfile.objects.create(
            auth_id=uuid.uuid4(),
            email='todelete@test.com',
            nombre='User to Delete',
            rol='OPERARIO'
        )

        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.admin_token}')
        response = self.client.delete(f'{self.base_url}/{user_to_delete.auth_id}/delete/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(UserProfile.objects.filter(auth_id=user_to_delete.auth_id).exists())


class SystemConfigTests(APITestCase):
    """Tests for system configuration endpoints."""

    def setUp(self):
        """Set up test client and fixtures."""
        self.client = APIClient()
        self.base_url = '/api/users'

        # Create admin user
        self.admin_id = uuid.uuid4()
        self.admin = UserProfile.objects.create(
            auth_id=self.admin_id,
            email='admin@test.com',
            nombre='Admin Test',
            rol='ADMIN'
        )
        self.admin_token = self._generate_token(self.admin_id, 'admin@test.com')

    def _generate_token(self, user_id, email):
        """Generate a JWT token for testing."""
        payload = {
            'sub': str(user_id),
            'email': email,
            'iat': int(timezone.now().timestamp()),
            'exp': int((timezone.now() + timezone.timedelta(hours=1)).timestamp()),
        }
        return jwt.encode(payload, settings.SECRET_KEY, algorithm='HS256')

    def test_get_system_config_as_admin(self):
        """Test get system config as admin."""
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.admin_token}')
        response = self.client.get(f'{self.base_url}/system-config/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('tasa_interes', response.data)
        self.assertIn('impuesto_retraso', response.data)

