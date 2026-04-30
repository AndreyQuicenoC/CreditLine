-- ============================================================================
-- CreditLine Database Initialization Script
-- Run this script in Supabase SQL Editor to create required tables and triggers
-- ============================================================================

-- Create user_profiles table (stores custom user metadata)
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
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

-- Drop trigger if exists (for idempotency)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger to auto-create profile
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable RLS (Row Level Security) for user_profiles
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own profile
CREATE POLICY "Users can view their own profile"
ON public.user_profiles
FOR SELECT
USING (auth.uid() = auth_id);

-- Policy: Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
ON public.user_profiles
FOR SELECT
USING (
    (SELECT rol FROM public.user_profiles WHERE auth_id = auth.uid()) = 'ADMIN'
);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update their own profile"
ON public.user_profiles
FOR UPDATE
USING (auth.uid() = auth_id);

-- Policy: Admins can update all profiles
CREATE POLICY "Admins can update all profiles"
ON public.user_profiles
FOR UPDATE
USING (
    (SELECT rol FROM public.user_profiles WHERE auth_id = auth.uid()) = 'ADMIN'
);

-- ============================================================================
-- SEED DATA
-- ============================================================================
-- These users will be created manually via seed_auth.py script
-- This SQL provides the structure; the seed script handles user creation
-- ============================================================================
