-- create_system_config.sql
-- Creates initial system_config rows required by the app.

-- Example:
-- INSERT INTO system_config (key, value) VALUES ('version', '1.1.1');
-- Create system_config table for storing application configuration
CREATE TABLE IF NOT EXISTS system_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tasa_interes DECIMAL(5, 2) NOT NULL DEFAULT 10.0,
  impuesto_retraso DECIMAL(5, 2) NOT NULL DEFAULT 5.0,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Enable RLS on system_config
ALTER TABLE system_config ENABLE ROW LEVEL SECURITY;

-- Create RLS policy: Allow admins to read config
CREATE POLICY "Admins can read config" ON system_config
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.auth_id = auth.uid()
      AND user_profiles.rol = 'ADMIN'
    )
  );

-- Create RLS policy: Allow admins to update config
CREATE POLICY "Admins can update config" ON system_config
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.auth_id = auth.uid()
      AND user_profiles.rol = 'ADMIN'
    )
  );

-- Insert default configuration
INSERT INTO system_config (tasa_interes, impuesto_retraso)
VALUES (10.0, 5.0)
ON CONFLICT DO NOTHING;
