-- init_dev_data.sql
-- Dev data for local development

-- Example INSERTs for mock_auth_users or user_profiles go here.
-- Initialize development data
-- Run this directly in Supabase SQL Editor

-- Clear existing test data
DELETE FROM mock_auth_users WHERE email IN ('admin@example.com', 'operario@example.com');
DELETE FROM user_profiles WHERE email IN ('admin@example.com', 'operario@example.com');

-- Insert mock auth users
INSERT INTO mock_auth_users (auth_id, email, encrypted_password) VALUES
('550e8400-e29b-41d4-a716-446655440000'::uuid, 'admin@example.com', 'admin123'),
('550e8400-e29b-41d4-a716-446655440001'::uuid, 'operario@example.com', 'operario123');

-- Insert user profiles
INSERT INTO user_profiles (auth_id, email, nombre, rol, is_active) VALUES
('550e8400-e29b-41d4-a716-446655440000'::uuid, 'admin@example.com', 'Admin Test', 'ADMIN', true),
('550e8400-e29b-41d4-a716-446655440001'::uuid, 'operario@example.com', 'Operario Test', 'OPERARIO', true);

-- Verify
SELECT 'Test users created' as status;
SELECT COUNT(*) as mock_auth_count FROM mock_auth_users;
SELECT COUNT(*) as user_profiles_count FROM user_profiles;
