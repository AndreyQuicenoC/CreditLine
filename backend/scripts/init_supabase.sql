-- Create user_profiles table if not exists
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

CREATE INDEX IF NOT EXISTS idx_user_profiles_auth_id ON user_profiles(auth_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);

-- Create mock_auth_users table for testing
CREATE TABLE IF NOT EXISTS mock_auth_users (
  auth_id UUID PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  encrypted_password VARCHAR(255) NOT NULL
);

-- Create system_config table
CREATE TABLE IF NOT EXISTS system_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tasa_interes DECIMAL(5, 2) NOT NULL DEFAULT 10.0,
  impuesto_retraso DECIMAL(5, 2) NOT NULL DEFAULT 5.0,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_config ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can read own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can read all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can update profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can insert profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can delete profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can read config" ON system_config;
DROP POLICY IF EXISTS "Admins can update config" ON system_config;

-- RLS Policies for user_profiles
CREATE POLICY "Users can read own profile" ON user_profiles
  FOR SELECT
  USING (auth_id = auth.uid());

CREATE POLICY "Admins can read all profiles" ON user_profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.auth_id = auth.uid() AND up.rol = 'ADMIN'
    )
  );

CREATE POLICY "Admins can update profiles" ON user_profiles
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.auth_id = auth.uid() AND up.rol = 'ADMIN'
    )
  );

CREATE POLICY "Admins can insert profiles" ON user_profiles
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.auth_id = auth.uid() AND up.rol = 'ADMIN'
    )
  );

CREATE POLICY "Admins can delete profiles" ON user_profiles
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.auth_id = auth.uid() AND up.rol = 'ADMIN'
    )
  );

-- RLS Policies for system_config
CREATE POLICY "Admins can read config" ON system_config
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.auth_id = auth.uid()
      AND user_profiles.rol = 'ADMIN'
    )
  );

CREATE POLICY "Admins can update config" ON system_config
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.auth_id = auth.uid()
      AND user_profiles.rol = 'ADMIN'
    )
  );

-- Insert test users
INSERT INTO user_profiles (auth_id, nombre, email, rol, is_active, ultimo_acceso)
VALUES (
  '00000000-0000-0000-0000-000000000001'::uuid,
  'Admin Principal',
  'admin@creditline.com',
  'ADMIN',
  true,
  CURRENT_TIMESTAMP
)
ON CONFLICT (email) DO NOTHING;

INSERT INTO user_profiles (auth_id, nombre, email, rol, is_active, ultimo_acceso)
VALUES (
  '00000000-0000-0000-0000-000000000002'::uuid,
  'Operario Demo',
  'operario@creditline.com',
  'OPERARIO',
  true,
  CURRENT_TIMESTAMP
)
ON CONFLICT (email) DO NOTHING;

-- Insert mock passwords
INSERT INTO mock_auth_users (auth_id, email, encrypted_password)
VALUES
  ('00000000-0000-0000-0000-000000000001'::uuid, 'admin@creditline.com', 'admin123'),
  ('00000000-0000-0000-0000-000000000002'::uuid, 'operario@creditline.com', 'operario123')
ON CONFLICT (email) DO NOTHING;

-- Insert default configuration
INSERT INTO system_config (tasa_interes, impuesto_retraso)
SELECT 10.0, 5.0
WHERE NOT EXISTS (SELECT 1 FROM system_config);

-- Verify
SELECT 'Setup completed successfully' as status;
