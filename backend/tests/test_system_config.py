"""
Test system configuration endpoints.
"""

import pytest
from rest_framework.test import APIClient
from django.db import connection


@pytest.mark.django_db
class TestSystemConfig:
    """Test system configuration management."""
    
    def setup_method(self):
        """Setup test client."""
        self.client = APIClient()
    
    def setup_system_config(self):
        """Setup system configuration in database."""
        with connection.cursor() as cursor:
            cursor.execute(
                """
                INSERT INTO system_config (tasa_interes, impuesto_retraso)
                VALUES (%s, %s)
                ON CONFLICT DO NOTHING;
                """,
                [10.0, 5.0]
            )
    
    def test_get_system_config_admin(self, admin_token):
        """Test getting system config as admin."""
        self.setup_system_config()
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {admin_token}')
        
        response = self.client.get('/api/users/system-config/')
        
        assert response.status_code == 200
        data = response.json()
        assert 'tasa_interes' in data
        assert 'impuesto_retraso' in data
        assert isinstance(data['tasa_interes'], (int, float))
        assert isinstance(data['impuesto_retraso'], (int, float))
    
    def test_get_system_config_operario_forbidden(self, operario_token):
        """Test that operario cannot get system config."""
        self.setup_system_config()
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {operario_token}')
        
        response = self.client.get('/api/users/system-config/')
        
        assert response.status_code == 403
        data = response.json()
        assert 'error' in data
    
    def test_update_system_config_admin(self, admin_token):
        """Test updating system config as admin."""
        self.setup_system_config()
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {admin_token}')
        
        response = self.client.put(
            '/api/users/system-config/update/',
            {
                'tasa_interes': 12.5,
                'impuesto_retraso': 7.5
            },
            format='json'
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data['tasa_interes'] == 12.5
        assert data['impuesto_retraso'] == 7.5
    
    def test_update_system_config_invalid_values(self, admin_token):
        """Test that invalid config values are rejected."""
        self.setup_system_config()
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {admin_token}')
        
        response = self.client.put(
            '/api/users/system-config/update/',
            {
                'tasa_interes': 150,  # Over 100%
                'impuesto_retraso': 5.0
            },
            format='json'
        )
        
        assert response.status_code == 400
        data = response.json()
        assert 'tasa_interes' in data
    
    def test_update_system_config_operario_forbidden(self, operario_token):
        """Test that operario cannot update system config."""
        self.setup_system_config()
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {operario_token}')
        
        response = self.client.put(
            '/api/users/system-config/update/',
            {
                'tasa_interes': 12.5,
                'impuesto_retraso': 7.5
            },
            format='json'
        )
        
        assert response.status_code == 403
        data = response.json()
        assert 'error' in data
