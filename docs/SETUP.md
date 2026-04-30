# CreditLine - Complete Setup Guide

Step-by-step instructions to set up CreditLine locally.

---

## Prerequisites

- **Python**: 3.10 or higher
- **Node.js**: 18 or higher
- **Git**: Latest version
- **Supabase Account**: Free tier available at https://supabase.com
- **Text Editor**: VS Code, PyCharm, or similar

### Check Versions
```bash
python --version      # Should be 3.10+
node --version        # Should be 18+
npm --version         # Should be 8+
git --version         # Should be 2.x+
```

---

## Step 1: Clone Repository

```bash
git clone https://github.com/AndreyQuicenoC/CreditLine.git
cd CreditLine
```

---

## Step 2: Supabase Setup

### 2.1 Create Supabase Project

1. Go to https://supabase.com and sign up/login
2. Click "New Project"
3. Fill in project details:
   - **Project name**: CreditLine
   - **Database password**: Generate strong password (save it!)
   - **Region**: Choose closest to your location
4. Click "Create new project" and wait (takes 1-2 minutes)

### 2.2 Get Credentials

Once project is created:

1. Go to **Settings** → **API** in sidebar
2. Copy the following and save them:
   - **Project URL** → `SUPABASE_URL`
   - **Anon Public Key** → `SUPABASE_ANON_KEY`
   - **Service Role Key** → `SUPABASE_SERVICE_ROLE_KEY` (keep secret!)

### 2.3 Initialize Database

1. Go to **SQL Editor** in sidebar
2. Click **New Query**
3. Copy all content from `scripts/init_supabase.sql`
4. Paste into the query editor
5. Click **Run**
6. Wait for tables and trigger to be created (should see green checkmark)

---

## Step 3: Backend Setup

### 3.1 Create Environment File

```bash
cp .env.example .env.local
```

Edit `.env.local` and fill in:
```
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_key_here
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@your-project-id.supabase.co:5432/postgres
```

### 3.2 Create Python Virtual Environment

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate it
# On macOS/Linux:
source venv/bin/activate

# On Windows:
venv\Scripts\activate
```

### 3.3 Install Dependencies

```bash
pip install -r requirements.txt
```

### 3.4 Create .env.local for Backend

```bash
cp ../.env.local .env.local
```

### 3.5 Seed Database

Run the seed script to create initial users:

```bash
python ../scripts/seed_auth.py
```

You should see:
```
🚀 Starting CreditLine database seeding...

📝 Creating user: admin@creditline.com...
   Updating profile: Admin Principal...
   Email: admin@creditline.com
   Password: admin123
   Role: ADMIN

📝 Creating user: operario@creditline.com...
   Updating profile: Operario Demo...
   Email: operario@creditline.com
   Password: operario123
   Role: OPERARIO

✅ Database seeding completed successfully!
```

### 3.6 Start Backend Server

```bash
python manage.py runserver
```

You should see:
```
Django version 4.2.13, using settings 'creditline.settings'
Starting development server at http://127.0.0.1:8000/
```

**Backend is now running at**: `http://localhost:8000`

---

## Step 4: Frontend Setup

Open a **NEW terminal window** (keep backend running in first terminal).

### 4.1 Navigate to Frontend

```bash
cd frontend
```

### 4.2 Create .env.local

```bash
cp ../.env.local .env.local
```

Verify it contains:
```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
VITE_API_URL=http://localhost:8000
```

### 4.3 Install Dependencies

```bash
npm install
```

This may take 2-3 minutes.

### 4.4 Start Frontend Dev Server

```bash
npm run dev
```

You should see:
```
  VITE v6.3.5  ready in 123 ms

  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

**Frontend is now running at**: `http://localhost:5173`

---

## Step 5: Test Login

### 5.1 Open Application

1. Open browser
2. Go to `http://localhost:5173/login`

### 5.2 Test Admin Login

1. Email: `admin@creditline.com`
2. Password: `admin123`
3. Click "Ingresar"
4. Should redirect to `/administracion` (admin dashboard)

### 5.3 Test Operator Login

1. Logout (click profile → logout)
2. Email: `operario@creditline.com`
3. Password: `operario123`
4. Should redirect to `/` (operator dashboard)

---

## Step 6: Verify Setup

### 6.1 Check Backend

```bash
curl http://localhost:8000/api/users/profile/ \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

Should return user profile data.

### 6.2 Check Supabase

Go to Supabase console:
1. **Table Editor** → `user_profiles`
2. Should see 2 rows (admin and operario)

### 6.3 Check Browser Console

Frontend should show:
- No CORS errors
- Successful API calls to backend
- JWT token in Supabase session

---

## Troubleshooting

### Issue: "Module not found: django"
**Solution**: Activate virtual environment
```bash
source venv/bin/activate  # macOS/Linux
# or
venv\Scripts\activate  # Windows
```

### Issue: "SUPABASE_SERVICE_ROLE_KEY not set"
**Solution**: Add to `.env.local`
```
SUPABASE_SERVICE_ROLE_KEY=your_key_here
```

### Issue: "Connection refused: :5173"
**Solution**: Frontend not running. Run `npm run dev` in frontend folder.

### Issue: "Connection refused: :8000"
**Solution**: Backend not running. Run `python manage.py runserver` in backend folder.

### Issue: "CORS error in browser"
**Solution**: Check `CORS_ALLOWED_ORIGINS` in `backend/creditline/settings.py`
```python
CORS_ALLOWED_ORIGINS = ['http://localhost:5173']  # Add if missing
```

### Issue: "Users not seeding"
**Solution**: Check Supabase credentials in `.env.local`
```bash
echo $SUPABASE_URL
echo $SUPABASE_SERVICE_ROLE_KEY
```

---

## Development Workflow

### Running Locally (3 Terminals)

**Terminal 1 - Backend**:
```bash
cd backend
source venv/bin/activate
python manage.py runserver
```

**Terminal 2 - Frontend**:
```bash
cd frontend
npm run dev
```

**Terminal 3 - Utilities/Git** (as needed):
```bash
cd CreditLine
git status
git add .
git commit -m "feat: description"
```

### Making Changes

1. Edit files
2. Changes are hot-reloaded (frontend) or auto-reload (backend)
3. Test in browser
4. Commit and push

---

## Common Commands

### Backend

```bash
# Start server
python manage.py runserver

# Create migrations
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Access admin panel
# Go to http://localhost:8000/admin/

# Run tests (coming soon)
python manage.py test
```

### Frontend

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

### Git

```bash
# Check status
git status

# Add all changes
git add .

# Commit
git commit -m "feat: your message"

# Push to remote
git push origin main
```

---

## Next Steps

1. ✓ Setup complete
2. Review backend code in `backend/apps/`
3. Review frontend code in `frontend/src/app/`
4. Read `docs/API.md` for API documentation
5. Read `SECURITY_CHECKLIST.md` for security best practices
6. Start building features (admin section, client management, etc.)

---

## Getting Help

- **Supabase Docs**: https://supabase.com/docs
- **Django Docs**: https://docs.djangoproject.com/
- **React Docs**: https://react.dev/
- **Issues**: Open a GitHub issue

---

**Last Updated**: 2026-04-29  
**Status**: Ready for Development
