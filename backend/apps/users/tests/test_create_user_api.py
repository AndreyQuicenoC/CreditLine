from django.test import TestCase
from rest_framework.test import APIClient
from apps.users.models import UserProfile
import uuid

class CreateUserAPITest(TestCase):
    def setUp(self):
        # Create admin profile and mock auth user
        self.admin_id = uuid.uuid4()
        self.admin_email = 'admin_test@creditline.com'
        UserProfile.objects.create(
            auth_id=self.admin_id,
            email=self.admin_email,
            nombre='Admin Test',
            rol='ADMIN',
            is_active=True
        )
        # Insert into mock_auth_users table via raw SQL
        from django.db import connection
        with connection.cursor() as cursor:
            cursor.execute(
                "INSERT INTO mock_auth_users (id, email, encrypted_password) VALUES (%s, %s, %s) ON CONFLICT (email) DO UPDATE SET encrypted_password = EXCLUDED.encrypted_password;",
                [str(self.admin_id), self.admin_email, 'admin123']
            )

        # Generate token using project's helper if available
        from apps.users.views import generate_jwt_token
        self.token = generate_jwt_token(str(self.admin_id), self.admin_email)

        self.client = APIClient()
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token}')

    def test_create_user_success(self):
        payload = {
            'nombre': 'Test User',
            'email': 'testuser@example.com',
            'rol': 'OPERARIO',
            'password': 'testpass123'
        }
        response = self.client.post('/api/users/create/', payload, format='json')
        self.assertIn(response.status_code, (200, 201))
        # Verify user profile exists
        self.assertTrue(UserProfile.objects.filter(email='testuser@example.com').exists())
