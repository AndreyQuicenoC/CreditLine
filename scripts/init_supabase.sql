-- ============================================================================
-- CreditLine Database Initialization Script
-- Run this script in Supabase SQL Editor to create required tables and triggers
-- ============================================================================

-- Create mock auth users table for local testing (optional)
-- In production, this is handled by Supabase Auth (auth.users)
-- This table simulates auth.users for development purposes
CREATE TABLE IF NOT EXISTS public.mock_auth_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    encrypted_password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create user_profiles table (stores custom user metadata)
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_id UUID NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    rol VARCHAR(50) NOT NULL DEFAULT 'OPERARIO' CHECK (rol IN ('ADMIN', 'OPERARIO')),
    is_active BOOLEAN NOT NULL DEFAULT true,
    ultimo_acceso TIMESTAMP WITH TIME ZONE NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_auth_id ON public.user_profiles(auth_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_rol ON public.user_profiles(rol);
CREATE INDEX IF NOT EXISTS idx_user_profiles_created_at ON public.user_profiles(created_at);
CREATE INDEX IF NOT EXISTS idx_mock_auth_users_email ON public.mock_auth_users(email);

-- Create trigger function to auto-create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (
        auth_id,
        email,
        nombre,
        rol,
        is_active
    ) VALUES (
        new.id,
        new.email,
        new.email,  -- Default to email as nombre
        'OPERARIO',  -- Default role
        true
    );
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if exists (for idempotency)
DROP TRIGGER IF EXISTS on_auth_user_created ON public.mock_auth_users;

-- Create trigger to auto-create profile when auth user is created
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON public.mock_auth_users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable RLS (Row Level Security) for user_profiles
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_profiles;

-- Policy: Users can only see their own profile
CREATE POLICY "Users can view their own profile"
ON public.user_profiles
FOR SELECT
USING (
    CASE
        WHEN auth.uid() IS NOT NULL THEN auth_id = auth.uid()
        ELSE true  -- Allow in dev/testing
    END
);

-- Policy: Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
ON public.user_profiles
FOR SELECT
USING (
    CASE
        WHEN auth.uid() IS NOT NULL THEN
            (SELECT rol FROM public.user_profiles WHERE auth_id = auth.uid()) = 'ADMIN'
        ELSE true  -- Allow in dev/testing
    END
);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update their own profile"
ON public.user_profiles
FOR UPDATE
USING (
    CASE
        WHEN auth.uid() IS NOT NULL THEN auth_id = auth.uid()
        ELSE true  -- Allow in dev/testing
    END
);

-- ============================================================================
-- SEED DATA (Initial Users)
-- ============================================================================
INSERT INTO public.mock_auth_users (email, encrypted_password)
VALUES
    ('admin@creditline.com', 'admin123'),
    ('operario@creditline.com', 'operario123')
ON CONFLICT (email) DO NOTHING;

-- ============================================================================
-- Verify Setup
-- ============================================================================
-- SELECT 'Setup Complete' as status;
-- SELECT COUNT(*) as user_profiles_count FROM public.user_profiles;
-- SELECT * FROM public.user_profiles;
