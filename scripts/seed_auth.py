#!/usr/bin/env python
"""
Seed CreditLine with initial users.

This script creates the admin and operario demo users in Supabase Auth.
Usage: python scripts/seed_auth.py
"""

import os
import sys
from pathlib import Path
from decouple import config

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from supabase import create_client, Client


def seed_users():
    """Create initial users in Supabase Auth."""

    # Get Supabase credentials
    supabase_url = config('SUPABASE_URL', default='https://cnlapwhaumnxphdsqtjn.supabase.co')
    supabase_service_key = config('SUPABASE_SERVICE_ROLE_KEY', default='')

    if not supabase_service_key:
        print("❌ Error: SUPABASE_SERVICE_ROLE_KEY not set in environment")
        print("   Please set this in your .env.local file")
        sys.exit(1)

    # Initialize Supabase client with service role (admin privileges)
    supabase: Client = create_client(supabase_url, supabase_service_key)

    users_to_create = [
        {
            'email': 'admin@creditline.com',
            'password': 'admin123',
            'nombre': 'Admin Principal',
            'rol': 'ADMIN',
        },
        {
            'email': 'operario@creditline.com',
            'password': 'operario123',
            'nombre': 'Operario Demo',
            'rol': 'OPERARIO',
        },
    ]

    print("🚀 Starting CreditLine database seeding...\n")

    for user_data in users_to_create:
        email = user_data['email']
        password = user_data['password']
        nombre = user_data['nombre']
        rol = user_data['rol']

        try:
            # Check if user already exists
            existing = supabase.table('user_profiles').select('*').eq('email', email).execute()

            if existing.data:
                print(f"✅ User already exists: {email} ({rol})")
                continue

            # Create user in auth.users
            print(f"📝 Creating user: {email}...", end=' ')
            response = supabase.auth.admin.create_user(
                email=email,
                password=password,
                email_confirm=True,  # Skip email confirmation for demo
                user_metadata={'nombre': nombre, 'rol': rol}
            )

            auth_user = response.user
            print(f"✓ (auth_id: {str(auth_user.id)[:8]}...)")

            # Update user_profiles with nombre and rol
            # (profile auto-created by trigger, just update it)
            print(f"   Updating profile: {nombre}...", end=' ')
            update_response = supabase.table('user_profiles').update({
                'nombre': nombre,
                'rol': rol,
                'email': email,
            }).eq('auth_id', str(auth_user.id)).execute()

            print("✓")
            print(f"   Email: {email}")
            print(f"   Password: {password}")
            print(f"   Role: {rol}\n")

        except Exception as e:
            error_msg = str(e)
            # Check if user already exists (different error message)
            if 'already registered' in error_msg or 'User already exists' in error_msg:
                print(f"✅ User already exists: {email}")
                continue
            else:
                print(f"❌ Error creating user {email}: {error_msg}")
                continue

    print("\n" + "="*60)
    print("✅ Database seeding completed successfully!")
    print("="*60)
    print("\nYou can now login with:")
    print("  Admin:    admin@creditline.com / admin123")
    print("  Operator: operario@creditline.com / operario123")
    print("\n")


if __name__ == '__main__':
    seed_users()
