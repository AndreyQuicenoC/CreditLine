# Setup Guide - CreditLine Backend

## Quick Start

### 1. Initialize Development Data

Run this SQL script in **Supabase SQL Editor**:

```sql
-- Initialize development data
DELETE FROM mock_auth_users WHERE email IN ('admin@example.com', 'operario@example.com');
DELETE FROM user_profiles WHERE email IN ('admin@example.com', 'operario@example.com');

INSERT INTO mock_auth_users (auth_id, email, encrypted_password) VALUES
('550e8400-e29b-41d4-a716-446655440000'::uuid, 'admin@example.com', 'admin123'),
('550e8400-e29b-41d4-a716-446655440001'::uuid, 'operario@example.com', 'operario123');

INSERT INTO user_profiles (auth_id, email, nombre, rol, is_active) VALUES
('550e8400-e29b-41d4-a716-446655440000'::uuid, 'admin@example.com', 'Admin Test', 'ADMIN', true),
('550e8400-e29b-41d4-a716-446655440001'::uuid, 'operario@example.com', 'Operario Test', 'OPERARIO', true);
```

### 2. Start Backend Server

```bash
cd backend
python manage.py runserver_safe 8000
```

**Note**: Use `runserver_safe` on Windows due to encoding issues with Supabase credentials. On Linux/macOS, you can use `python manage.py runserver 8000`.

### 3. Start Frontend Server

```bash
cd frontend
npm run dev
```

This starts the frontend on http://localhost:5173

### 4. Test Login

**Admin:**
- Email: `admin@example.com`
- Password: `admin123`

**Operario:**
- Email: `operario@example.com`
- Password: `operario123`

## Backend Configuration

The backend requires these environment variables in `.env` or `.env.local`:

```env
# Database (Supabase PostgreSQL)
DATABASE_HOST=db.cnlapwhaumnxphdsqtjn.supabase.co
DATABASE_PORT=5432
DATABASE_NAME=postgres
DATABASE_USER=postgres
DATABASE_PASSWORD=your_supabase_password

# CORS (for frontend connection)
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173

# Django
DEBUG=True
SECRET_KEY=your-secret-key-here

# Supabase (optional, for future Auth integration)
SUPABASE_URL=https://cnlapwhaumnxphdsqtjn.supabase.co
SUPABASE_KEY=your_supabase_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## API Endpoints

### Authentication

- **POST** `/api/users/login/` - Login with email and password
- **GET** `/api/users/profile/` - Get current user profile (requires token)
- **PUT** `/api/users/profile/update/` - Update current user profile (requires token)

### User Management (Admin Only)

- **GET** `/api/users/list/` - List all users
- **POST** `/api/users/create/` - Create new user
- **PATCH** `/api/users/<user_id>/edit/` - Edit user
- **DELETE** `/api/users/<user_id>/delete/` - Delete user

### System Configuration (Admin Only)

- **GET** `/api/users/system-config/` - Get system configuration
- **POST** `/api/users/system-config/update/` - Update system configuration

## Testing

```bash
cd backend
pytest tests/

# Run specific test file
pytest tests/test_auth.py -v

# Run with coverage
pytest tests/ --cov=apps --cov-report=html
```

**Note**: Tests use fixtures defined in `tests/conftest.py`. Each test creates its own test users.

## Troubleshooting

### "Failed to fetch" from Frontend

1. Verify backend is running: `curl http://127.0.0.1:8000/`
2. Check CORS is configured: Response should include `Access-Control-Allow-Origin` header
3. Verify credentials exist in database:
   ```sql
   SELECT * FROM mock_auth_users;
   SELECT * FROM user_profiles;
   ```

### "Internal server error" from Login

The login endpoint returns this when:
1. `mock_auth_users` table doesn't have the email
2. Password doesn't match
3. `user_profiles` table doesn't have matching profile

Run the SQL initialization script above.

### Backend won't start

**On Windows**: Use `python manage.py runserver_safe 8000` instead of `runserver`. See [WINDOWS_ENCODING_FIX.md](../docs/WINDOWS_ENCODING_FIX.md) for details.

### Database connection fails

Make sure `.env` or `.env.local` has correct Supabase credentials:
```bash
# Print current config (sanitized)
python manage.py shell
>>> from django.conf import settings
>>> print(f"Host: {settings.DATABASES['default']['HOST']}")
>>> print(f"User: {settings.DATABASES['default']['USER']}")
>>> print(f"DB: {settings.DATABASES['default']['NAME']}")
```

## File Organization

```
backend/
├── creditline/          # Django settings & URLs
│   ├── settings.py      # Configuration
│   ├── urls.py          # URL routing
│   ├── asgi.py          # Async server
│   └── wsgi.py          # WSGI server
├── apps/
│   └── users/           # User management app
│       ├── models.py    # User models
│       ├── views.py     # API endpoints
│       ├── serializers.py # Response serializers
│       ├── urls.py      # User app routes
│       ├── admin.py     # Django admin
│       └── management/  # Management commands
│           └── commands/
│               └── init_dev_data.py  # Initialize test data
├── core/
│   ├── authentication.py # JWT auth
│   └── middleware.py    # Security middleware
├── tests/              # Pytest tests
│   ├── conftest.py    # Fixtures & setup
│   ├── test_auth.py   # Authentication tests
│   ├── test_users.py  # User management tests
│   └── test_system_config.py # Config tests
├── scripts/
│   ├── init_supabase.sql  # Database setup
│   └── init_dev_data.sql  # Development data
├── manage.py           # Django CLI
├── requirements.txt    # Python dependencies
└── pytest.ini         # Pytest configuration
```

## Deployment

For production deployment:

1. Set `DEBUG=False` in `.env`
2. Use a production ASGI server (Gunicorn, Uvicorn) instead of `runserver`
3. Use proper database connection pooling
4. Set all required environment variables securely
5. Enable HTTPS and set `SECURE_SSL_REDIRECT=True`
6. Run migrations before deploying: `python manage.py migrate`

See [DEPLOYMENT_CHECKLIST.md](../docs/DEPLOYMENT_CHECKLIST.md) for details.
