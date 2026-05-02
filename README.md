# CreditLine

![Node.js](https://img.shields.io/badge/node-%3E%3D18-brightgreen) ![Python](https://img.shields.io/badge/python-%3E%3D3.10-blue) ![Vite](https://img.shields.io/badge/vite-%3E%3D4-purple) ![Supabase](https://img.shields.io/badge/supabase-managed-orange)

**Personal Loan Management System** by ClustLayer (Eureka Solutions Projects)

Current release: **1.2.0**

A professional-grade loan management platform for administering and tracking personal loans, client portfolios, and financial operations.

---

## Project Overview

CreditLine is a comprehensive loan management system designed for financial institutions and individuals managing personal lending portfolios. It features:

- **Role-Based Access**: Admin and Operator roles with distinct permissions
- **Client Portfolio Management**: Track clients and their loan history
- **Loan & Payment Tracking**: Monitor loans, payments, and interest
- **Financial Analytics**: Detailed statistics and reporting on portfolio performance
- **Professional UI**: Modern, accessible, and responsive design

---

## Tech Stack

### Backend

- **Framework**: Django 4.2+ with Django REST Framework
- **Database**: PostgreSQL (via Supabase)
- **Authentication**: Supabase Auth (native JWT)
- **Deployment**: Docker-ready

### Frontend

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **UI Components**: Shadcn/ui
- **Styling**: Tailwind CSS
- **State Management**: React Context + Supabase Session
- **Animations**: Motion

### Infrastructure

- **Database**: Supabase (managed PostgreSQL)
- **Authentication**: Supabase Auth
- **Version Control**: Git / GitHub

---

## Project Structure

```
CreditLine/
├── backend/                    # Django REST API
│   ├── creditline/            # Main Django project
│   ├── apps/
│   │   └── users/             # User management app
│   ├── core/                  # Shared utilities & middleware
│   ├── requirements.txt
│   └── manage.py
├── frontend/                   # React Vite application
│   ├── src/
│   │   ├── app/
│   │   │   ├── context/       # React Context (Auth)
│   │   │   ├── pages/         # Route pages
│   │   │   ├── services/      # API & Supabase clients
│   │   │   ├── components/    # Reusable components
│   │   │   └── routes.tsx     # Route configuration
│   │   └── styles/
│   ├── package.json
│   └── vite.config.ts
├── docs/                       # Documentation
│   ├── API.md
│   ├── DATABASE.md
│   ├── SETUP.md
│   └── SECURITY.md
├── scripts/                    # Utility scripts
│   └── seed_auth.py           # Database seeding
├── .ci-cd/                    # CI/CD configuration
└── README.md                  # This file
```

---

## Quick Start

### Prerequisites

- Python 3.10+
- Node.js 18+
- Git
- Supabase account (free tier available)

### Setup

#### 1. Clone and Setup Environment

```bash
git clone https://github.com/AndreyQuicenoC/CreditLine.git
cd CreditLine

# Copy environment template
cp .env.example .env.local

# Update .env.local with your Supabase credentials
# - SUPABASE_URL
# - SUPABASE_ANON_KEY
# - SUPABASE_SERVICE_ROLE_KEY
```

#### 2. Database Setup (Supabase Console)

See `docs/SETUP.md` for step-by-step Supabase configuration.

#### 3. Backend Setup

```bash
cd backend

# Activate the project virtual environment
# Windows PowerShell:
../.venv/Scripts/Activate.ps1
# macOS / Linux:
source ../.venv/bin/activate

# Install dependencies
python -m pip install -r requirements.txt

# Create .env.local with your Supabase credentials
cp ../.env.local .env.local

# Seed initial users
python scripts/seed_auth.py

# Run server
python manage.py runserver 0.0.0.0:8000
```

**Backend available at**: `http://localhost:8000`

If `python manage.py runserver` reports `ModuleNotFoundError: No module named 'django'`, activate the project venv first and reinstall the backend requirements.

#### 4. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env.local with Supabase config
cp ../.env.local .env.local

# Run development server
npm run dev
```

**Frontend available at**: `http://localhost:5173`

#### 5. Test Login

- Navigate to `http://localhost:5173/login`
- Login with:
  - **Admin**: admin@creditline.com / admin123
  - **Operator**: operario@creditline.com / operario123

---

## Documentation

- **[API Documentation](./docs/API.md)** - API endpoints and usage
- **[Database Schema](./docs/DATABASE.md)** - Database structure and relationships
- **[Setup Guide](./docs/SETUP.md)** - Detailed setup instructions
- **[Security](./docs/SECURITY.md)** - Security practices and measures

---

## Development

### Running Locally

**Terminal 1 - Backend**:

```bash
cd backend
# Windows PowerShell:
../.venv/Scripts/Activate.ps1
# macOS / Linux:
source ../.venv/bin/activate
python manage.py runserver
```

**Terminal 2 - Frontend**:

```bash
cd frontend
npm run dev
```

### Making Changes

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make changes and test locally
3. Commit with descriptive messages: `git commit -m "feat: add new feature"`
4. Push to origin: `git push origin feature/your-feature`
5. Create a pull request on GitHub

---

## Git Workflow

### Main Branch

- Stable, production-ready code
- Protected: requires PR review
- Changes via pull requests only

### Feature Branches

- `feature/admin-section` - Admin dashboard and management
- `feature/operation-section` - Operator portal and workflows
- `feature/*` - Individual feature branches

---

## Security

This project implements security best practices from day 1:

- ✓ Password hashing (Supabase Auth)
- ✓ JWT validation on backend
- ✓ CORS configuration
- ✓ SQL injection prevention (Django ORM)
- ✓ XSS prevention (React sanitization)
- ✓ HTTPS-ready (production)
- ✓ Input validation on both frontend and backend

See `SECURITY_CHECKLIST.md` for detailed security measures.

---

## Support & Contact

**Project**: CreditLine  
**Organization**: ClustLayer  
**Line**: Eureka Solutions Projects

For issues, questions, or contributions, please open a GitHub issue or contact the development team.

---

## License

Proprietary software. See [LICENSE](./LICENSE) for the full terms.

---

## Changelog

See [CHANGELOG.md](./CHANGELOG.md) for the full release history.

### v1.1.1 - Patch

- Fix: Create user flow compatible with dev mock_auth_users schema (avoid auth_id column errors).
- UX: Keep create/edit modal open on validation/server errors; add Enter-to-submit and password visibility toggle.
- Notifications: add explicit close action to toasts.

### v1.1.0 - Admin Section

- First dedicated administrator section.
- Updated deployment guidance and release metadata.
- Verified backend and frontend production checks.

### v0.1.0 - Base Version

- Project structure.
- User authentication (ADMIN / OPERARIO roles).
- Login page with validation.
- Role-based routing.
- Supabase integration.
- API foundation.
