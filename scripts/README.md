# Scripts - Utility Scripts for CreditLine

This directory contains utility scripts for setup, seeding, and maintenance.

## Scripts

### `init_supabase.sql`

SQL script to initialize Supabase database structure.

**Usage**:

1. Go to Supabase Dashboard → SQL Editor
2. Create a new query
3. Copy and paste the contents of `init_supabase.sql`
4. Click "Run"

**Creates**:

- `user_profiles` table (custom user metadata)
- Indexes for performance
- Trigger to auto-create profiles on auth sign-up
- RLS policies for security

### `seed_auth.py`

Python script to seed initial users in Supabase Auth.

**Prerequisites**:

- Python 3.10+
- `.env.local` file with `SUPABASE_SERVICE_ROLE_KEY`

**Usage**:

```bash
cd backend
python ../scripts/seed_auth.py
```

**Creates**:

- admin@creditline.com / admin123 (ADMIN role)
- operario@creditline.com / operario123 (OPERARIO role)

**Note**: The script will skip users that already exist.

---

## Setup Workflow

1. **Setup Supabase**
   - Create Supabase project
   - Get credentials (URL, anon key, service role key)
   - Save to `.env.local`

2. **Initialize Database**
   - Run `init_supabase.sql` in Supabase SQL Editor

3. **Seed Users**
   - Run `seed_auth.py`
   - Verify users created

4. **Start Backend**
   - `python manage.py runserver`

5. **Start Frontend**
   - `npm run dev`

---

## Notes

- All scripts are idempotent (safe to run multiple times)
- Never commit `.env.local` to Git
- Service role key has admin privileges; keep it secret
- Seed users are for development only; remove for production
