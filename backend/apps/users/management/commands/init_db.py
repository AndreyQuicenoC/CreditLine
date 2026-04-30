from django.core.management.base import BaseCommand
from django.db import connection
import logging

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'Initialize the database with required tables for the CreditLine application'

    def handle(self, *args, **options):
        """Initialize database tables if they don't exist."""
        self.stdout.write('Starting database initialization...')

        try:
            with connection.cursor() as cursor:
                # Create user_profiles table
                self.stdout.write('Creating user_profiles table...')
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS user_profiles (
                        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                        auth_id UUID NOT NULL UNIQUE,
                        nombre VARCHAR(255) NOT NULL,
                        email VARCHAR(255) NOT NULL UNIQUE,
                        rol VARCHAR(50) NOT NULL CHECK (rol IN ('ADMIN', 'OPERARIO')),
                        is_active BOOLEAN DEFAULT true,
                        ultimo_acceso TIMESTAMP NULL,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    );
                """)
                self.stdout.write(self.style.SUCCESS('✓ user_profiles table created'))

                # Create indexes
                self.stdout.write('Creating indexes...')
                cursor.execute(
                    "CREATE INDEX IF NOT EXISTS idx_user_profiles_auth_id ON user_profiles(auth_id);"
                )
                cursor.execute(
                    "CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);"
                )
                self.stdout.write(self.style.SUCCESS('✓ Indexes created'))

                # Create mock_auth_users table for testing
                self.stdout.write('Creating mock_auth_users table...')
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS mock_auth_users (
                        id UUID PRIMARY KEY,
                        email VARCHAR(255) NOT NULL UNIQUE,
                        encrypted_password VARCHAR(255) NOT NULL,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    );
                """)
                self.stdout.write(self.style.SUCCESS('✓ mock_auth_users table created'))

                # Create system_config table
                self.stdout.write('Creating system_config table...')
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS system_config (
                        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                        tasa_interes DECIMAL(5, 2) NOT NULL DEFAULT 10.0,
                        impuesto_retraso DECIMAL(5, 2) NOT NULL DEFAULT 5.0,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_by UUID
                    );
                """)
                self.stdout.write(self.style.SUCCESS('✓ system_config table created'))

                # Create trigger function to auto-create profile when auth user is created
                self.stdout.write('Creating trigger function handle_new_user...')
                cursor.execute("""
                    CREATE OR REPLACE FUNCTION public.handle_new_user()
                    RETURNS TRIGGER AS $$
                    BEGIN
                        -- Insert profile only if not exists for this auth id
                        INSERT INTO public.user_profiles (auth_id, email, nombre, rol, is_active)
                        VALUES (new.id, new.email, new.email, 'OPERARIO', true)
                        ON CONFLICT (auth_id) DO NOTHING;
                        RETURN new;
                    END;
                    $$ LANGUAGE plpgsql SECURITY DEFINER;
                """)
                self.stdout.write(self.style.SUCCESS('✓ trigger function created'))

                # Create trigger for mock_auth_users
                self.stdout.write('Creating trigger on mock_auth_users...')
                cursor.execute('DROP TRIGGER IF EXISTS on_auth_user_created ON public.mock_auth_users;')
                cursor.execute("""
                    CREATE TRIGGER on_auth_user_created
                    AFTER INSERT ON public.mock_auth_users
                    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
                """)
                self.stdout.write(self.style.SUCCESS('✓ trigger created'))

                # Check if system_config has any rows, if not insert defaults
                self.stdout.write('Checking system_config defaults...')
                cursor.execute("SELECT COUNT(*) FROM system_config;")
                count = cursor.fetchone()[0]

                if count == 0:
                    self.stdout.write('Inserting default system configuration...')
                    cursor.execute("""
                        INSERT INTO system_config (tasa_interes, impuesto_retraso)
                        VALUES (10.0, 5.0);
                    """)
                    self.stdout.write(self.style.SUCCESS('✓ Default system configuration inserted'))
                else:
                    self.stdout.write(f'✓ system_config already has {count} row(s)')

                self.stdout.write(self.style.SUCCESS('\n✅ Database initialization completed successfully!'))

        except Exception as e:
            self.stdout.write(self.style.ERROR(f'❌ Error initializing database: {str(e)}'))
            logger.error(f'Database initialization error: {str(e)}', exc_info=True)
            raise
