"""
Initialize development data: Create test users in mock_auth_users and user_profiles.
Usage: python manage.py init_dev_data
"""

from django.core.management.base import BaseCommand
from django.db import connection
from apps.users.models import UserProfile
import uuid


class Command(BaseCommand):
    help = 'Initialize development data with test users'

    def handle(self, *args, **options):
        with connection.cursor() as cursor:
            # Ensure mock_auth_users table exists
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS mock_auth_users (
                    auth_id UUID PRIMARY KEY,
                    email VARCHAR(255) NOT NULL UNIQUE,
                    encrypted_password VARCHAR(255) NOT NULL
                );
            """)

            # Clear existing test data
            cursor.execute("DELETE FROM mock_auth_users WHERE email IN ('admin@example.com', 'operario@example.com');")

            # Create admin user
            admin_id = uuid.uuid4()
            cursor.execute(
                """
                INSERT INTO mock_auth_users (auth_id, email, encrypted_password)
                VALUES (%s, %s, %s)
                ON CONFLICT (email) DO UPDATE SET encrypted_password = EXCLUDED.encrypted_password;
                """,
                [str(admin_id), 'admin@example.com', 'admin123']
            )
            self.stdout.write(self.style.SUCCESS(f'✓ Created mock_auth_users: admin@example.com'))

            # Create operario user
            operario_id = uuid.uuid4()
            cursor.execute(
                """
                INSERT INTO mock_auth_users (auth_id, email, encrypted_password)
                VALUES (%s, %s, %s)
                ON CONFLICT (email) DO UPDATE SET encrypted_password = EXCLUDED.encrypted_password;
                """,
                [str(operario_id), 'operario@example.com', 'operario123']
            )
            self.stdout.write(self.style.SUCCESS(f'✓ Created mock_auth_users: operario@example.com'))

        # Create UserProfile entries
        admin_profile, created = UserProfile.objects.update_or_create(
            email='admin@example.com',
            defaults={
                'auth_id': admin_id,
                'nombre': 'Admin Test',
                'rol': 'ADMIN',
                'is_active': True
            }
        )
        self.stdout.write(self.style.SUCCESS(f'✓ Created UserProfile: {admin_profile.nombre} (ADMIN)'))

        operario_profile, created = UserProfile.objects.update_or_create(
            email='operario@example.com',
            defaults={
                'auth_id': operario_id,
                'nombre': 'Operario Test',
                'rol': 'OPERARIO',
                'is_active': True
            }
        )
        self.stdout.write(self.style.SUCCESS(f'✓ Created UserProfile: {operario_profile.nombre} (OPERARIO)'))

        self.stdout.write(self.style.SUCCESS('\n✓ Development data initialized successfully!\n'))
        self.stdout.write('Test credentials:')
        self.stdout.write('  Admin: admin@example.com / admin123')
        self.stdout.write('  Operario: operario@example.com / operario123')
