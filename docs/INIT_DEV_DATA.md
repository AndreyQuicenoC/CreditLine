# Setup: Initialize Development Data

## Problem
Due to Windows encoding issues with Supabase database credentials, Python scripts cannot connect directly to the database. However, the Django development server (`runserver_safe`) works because it skips migration checks on startup.

## Solution: Manual Initialization in Supabase SQL Editor

### Step 1: Open Supabase SQL Editor
1. Go to https://supabase.com/dashboard
2. Select your project
3. Click **"SQL Editor"** on the left sidebar
4. Click **"New Query"**

### Step 2: Run Initialization SQL

Copy and paste this SQL into the query editor and click **"Run"**:

```sql
-- =====================================================
-- CreditLine Development Data Initialization
-- Run this in Supabase SQL Editor
-- =====================================================

-- Step 1: Ensure table exists
CREATE TABLE IF NOT EXISTS public.mock_auth_users (
    auth_id UUID PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    encrypted_password VARCHAR(255) NOT NULL
);

-- Step 2: Clear existing test data
DELETE FROM public.mock_auth_users 
WHERE email IN ('admin@example.com', 'operario@example.com');

DELETE FROM public.user_profiles 
WHERE email IN ('admin@example.com', 'operario@example.com');

-- Step 3: Insert mock auth users
INSERT INTO public.mock_auth_users (auth_id, email, encrypted_password) VALUES
    ('550e8400-e29b-41d4-a716-446655440000'::uuid, 'admin@example.com', 'admin123'),
    ('550e8400-e29b-41d4-a716-446655440001'::uuid, 'operario@example.com', 'operario123');

-- Step 4: Insert user profiles
INSERT INTO public.user_profiles (auth_id, email, nombre, rol, is_active) VALUES
    ('550e8400-e29b-41d4-a716-446655440000'::uuid, 'admin@example.com', 'Admin Test', 'ADMIN', true),
    ('550e8400-e29b-41d4-a716-446655440001'::uuid, 'operario@example.com', 'Operario Test', 'OPERARIO', true);

-- Step 5: Verify
SELECT 'Test data initialized!' as status;
SELECT COUNT(*) as admin_user_count FROM public.mock_auth_users;
SELECT COUNT(*) as profile_count FROM public.user_profiles;
```

### Step 3: Verify Success
You should see:
- `status`: "Test data initialized!"
- `admin_user_count`: 2
- `profile_count`: 2

## What This Creates

### Mock Auth Users
| Email | Password | Purpose |
|-------|----------|---------|
| `admin@example.com` | `admin123` | Admin user for testing |
| `operario@example.com` | `operario123` | Operator user for testing |

### User Profiles
| Email | Name | Role | Active |
|-------|------|------|--------|
| `admin@example.com` | Admin Test | ADMIN | true |
| `operario@example.com` | Operario Test | OPERARIO | true |

## Testing After Initialization

### Backend
```bash
cd backend
python manage.py runserver_safe 8000
```

### Frontend (in new terminal)
```bash
cd frontend
npm run dev
```

### Login Test
Open http://localhost:5173 and try:
- **Admin**: admin@example.com / admin123
- **Operario**: operario@example.com / operario123

### API Test (curl)
```bash
curl -X POST http://127.0.0.1:8000/api/users/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'
```

Expected response:
```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "admin@example.com",
    "nombre": "Admin Test",
    "rol": "ADMIN"
  },
  "token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "message": "Login successful"
}
```

## Troubleshooting

### "Internal server error" on login
- Check if `mock_auth_users` table has data: `SELECT * FROM public.mock_auth_users;`
- Check if `user_profiles` has matching records: `SELECT * FROM public.user_profiles;`
- Run the SQL initialization script above again

### CORS issues from frontend
- Verify `CORS_ALLOWED_ORIGINS` in `backend/.env` includes `http://localhost:5173`
- Restart the backend server

### Backend won't start
- Use `python manage.py runserver_safe 8000` on Windows
- On Linux/macOS, use `python manage.py runserver 8000`
- See [WINDOWS_ENCODING_FIX.md](./WINDOWS_ENCODING_FIX.md) for details

## Windows Encoding Issue Explanation
The database credentials in `.env` contain accented characters (like "ó") that are encoded as latin-1. When Python scripts run directly and try to connect, psycopg2 fails to decode the connection string. The `runserver_safe` command avoids this by skipping the migration check that would require a real database connection during startup.

In production on Linux/macOS, this issue doesn't occur and you can use standard `python manage.py runserver`.
