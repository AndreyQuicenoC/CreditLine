# CreditLine - Complete Setup Guide

## ⚡ Quick Start (5 minutes)

### Prerequisites
- Python 3.10+
- Node.js 18+  
- Supabase account
- Git

### Step-by-Step

#### 1. Clone the Repository
```bash
git clone https://github.com/AndreyQuicenoC/CreditLine.git
cd CreditLine/CreditLine
```

#### 2. Initialize Python Virtual Environment
```bash
# Create venv at project root
python -m venv .venv

# Activate venv
# Windows PowerShell:
.\.venv\Scripts\Activate.ps1
# macOS / Linux:
source .venv/bin/activate

# Install backend dependencies
pip install -r backend/requirements.txt
```

#### 3. Configure Environment
Create `backend/.env.local` with Supabase credentials:

```env
# Database
DATABASE_HOST=db.cnlapwhaumnxphdsqtjn.supabase.co
DATABASE_PORT=5432
DATABASE_NAME=postgres
DATABASE_USER=postgres
DATABASE_PASSWORD=YOUR_SUPABASE_PASSWORD

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173

# Django
DEBUG=True
SECRET_KEY=your-django-secret-key-here

# Supabase (optional for Auth integration)
SUPABASE_URL=https://cnlapwhaumnxphdsqtjn.supabase.co
SUPABASE_KEY=YOUR_SUPABASE_ANON_KEY
```

#### 4. Initialize Database
Run this SQL in **Supabase SQL Editor** (see [INIT_DEV_DATA.md](./docs/INIT_DEV_DATA.md)):

```sql
-- See docs/INIT_DEV_DATA.md for complete initialization script
CREATE TABLE IF NOT EXISTS public.mock_auth_users (
    auth_id UUID PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    encrypted_password VARCHAR(255) NOT NULL
);

INSERT INTO public.mock_auth_users (auth_id, email, encrypted_password) VALUES
    ('550e8400-e29b-41d4-a716-446655440000'::uuid, 'admin@example.com', 'admin123'),
    ('550e8400-e29b-41d4-a716-446655440001'::uuid, 'operario@example.com', 'operario123');

INSERT INTO public.user_profiles (auth_id, email, nombre, rol, is_active) VALUES
    ('550e8400-e29b-41d4-a716-446655440000'::uuid, 'admin@example.com', 'Admin Test', 'ADMIN', true),
    ('550e8400-e29b-41d4-a716-446655440001'::uuid, 'operario@example.com', 'Operario Test', 'OPERARIO', true);
```

#### 5. Start Backend
```bash
cd backend
# ⚠️ IMPORTANT: Use runserver_safe on Windows (fixes encoding issues)
python manage.py runserver_safe 8000

# On Linux/macOS, you can use:
python manage.py runserver 0.0.0.0:8000
```

Backend will be available at: **http://127.0.0.1:8000**

#### 6. Start Frontend (new terminal)
```bash
cd frontend
npm install
npm run dev
```

Frontend will be available at: **http://localhost:5173**

#### 7. Test Login
Navigate to http://localhost:5173

**Test credentials:**
- **Admin**: admin@example.com / admin123
- **Operario**: operario@example.com / operario123

---

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| [INIT_DEV_DATA.md](./docs/INIT_DEV_DATA.md) | Database initialization & troubleshooting |
| [BACKEND_SETUP.md](./docs/BACKEND_SETUP.md) | Detailed backend configuration |
| [WINDOWS_ENCODING_FIX.md](./docs/WINDOWS_ENCODING_FIX.md) | Windows-specific database encoding issues |
| [API.md](./docs/API.md) | REST API documentation |
| [DATABASE.md](./docs/DATABASE.md) | Database schema & tables |

---

## 🔧 Troubleshooting

### "Failed to fetch" from Frontend
1. ✓ Backend is running: `curl http://127.0.0.1:8000/`
2. ✓ Check CORS headers in response
3. ✓ Verify credentials in database

### "Internal server error" on Login
1. ✓ Run SQL initialization (step 4 above)
2. ✓ Verify users exist: `SELECT * FROM public.mock_auth_users;`
3. ✓ Check backend logs for detailed error

### Backend Won't Start

**Windows error: `UnicodeDecodeError`**
- ✓ Use `python manage.py runserver_safe 8000` instead
- See [WINDOWS_ENCODING_FIX.md](./docs/WINDOWS_ENCODING_FIX.md)

**Django errors**
- ✓ Check Python version: `python --version` (need 3.10+)
- ✓ Verify venv is activated
- ✓ Reinstall requirements: `pip install -r backend/requirements.txt`

### Frontend Won't Connect to Backend

**Check CORS Configuration**
```bash
# In backend/.env.local, ensure:
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

Then restart the backend.

---

## 🚀 Next Steps After Setup

### Run Tests
```bash
cd backend
pytest tests/ -v
```

### Create Admin User (After Initial Setup)
```bash
cd backend
python manage.py shell
>>> from apps.users.models import UserProfile
>>> from django.db import connection
>>> import uuid
>>> # ... create new user
```

### Deploy to Production
See [DEPLOYMENT_CHECKLIST.md](./docs/DEPLOYMENT_CHECKLIST.md)

---

## 📋 Project Structure

```
CreditLine/
├── backend/
│   ├── creditline/         # Django settings & URLs
│   ├── apps/users/         # User management API
│   ├── core/               # Shared auth & middleware
│   ├── tests/              # Pytest tests
│   ├── scripts/            # Utility scripts
│   ├── manage.py
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── app/            # React app root
│   │   ├── components/     # React components
│   │   ├── pages/          # Route pages
│   │   ├── services/       # API clients
│   │   └── context/        # Auth context
│   └── package.json
├── docs/                   # Documentation
├── scripts/                # Root level scripts
└── README.md              # This file
```

---

## 🔐 Security Notes

- ✓ `.env` files contain secrets - never commit them
- ✓ Use environment variables for production secrets
- ✓ Rotate database passwords regularly
- ✓ Enable Supabase Auth in production (not mock_auth_users)
- See [SECURITY_CHECKLIST.md](./docs/SECURITY_CHECKLIST.md)

---

## 📞 Support

For issues or questions:
1. Check the [documentation](./docs/)
2. Review [WINDOWS_ENCODING_FIX.md](./docs/WINDOWS_ENCODING_FIX.md) for Windows issues
3. Check [API.md](./docs/API.md) for endpoint details
