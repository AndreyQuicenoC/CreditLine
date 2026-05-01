from django.core.management.base import BaseCommand
from django.db import connection
from apps.users.models import UserProfile
import uuid
import logging

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'Create a test admin user for development'

    def handle(self, *args, **options):
        """Create a test admin user."""
        self.stdout.write('Creating test admin user...')

        try:
            admin_email = 'admin@creditline.com'
            admin_password = 'admin123'

            # Check if admin already exists
            if UserProfile.objects.filter(email=admin_email).exists():
                self.stdout.write(self.style.WARNING(f'✓ Admin user {admin_email} already exists'))
                return

            # Create admin user
            admin_id = uuid.uuid4()
            admin_user = UserProfile.objects.create(
                auth_id=admin_id,
                nombre='Admin User',
                email=admin_email,
                rol='ADMIN',
                is_active=True
            )
            self.stdout.write(self.style.SUCCESS(f'✓ Created admin user: {admin_email}'))

            # Store password in mock_auth_users
            try:
                with connection.cursor() as cursor:
                    # Note: mock_auth_users uses 'id' column (not 'auth_id')
                    cursor.execute(
                        """
                        INSERT INTO mock_auth_users (auth_id, email, encrypted_password)
                        VALUES (%s, %s, %s)
                        ON CONFLICT (email) DO UPDATE SET encrypted_password = EXCLUDED.encrypted_password;
                        """,
                        [str(admin_id), admin_email, admin_password]
                    )
                self.stdout.write(self.style.SUCCESS(f'✓ Stored password for admin user'))
            except Exception as e:
                self.stdout.write(self.style.WARNING(f'⚠ Could not store password in mock_auth_users: {str(e)}'))

            self.stdout.write(self.style.SUCCESS(f'\n✅ Test admin user created!'))
            self.stdout.write(f'Email: {admin_email}')
            self.stdout.write(f'Password: {admin_password}')

        except Exception as e:
            self.stdout.write(self.style.ERROR(f'❌ Error creating test admin user: {str(e)}'))
            logger.error(f'Create admin user error: {str(e)}', exc_info=True)
            raise
