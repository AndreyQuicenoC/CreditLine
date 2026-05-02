# Deployment Guide (concise)

1. Backend
   - Ensure Python 3.13 and virtualenv are available.
   - Install backend dependencies from `backend/requirements.txt`.
   - Apply database migrations and run any SQL initialization in `scripts/sql/`.
   - Configure environment variables (DATABASE_URL, SECRET_KEY, etc.).
   - Start Django with a production WSGI server (Gunicorn/uvicorn) behind a reverse proxy.

2. Database
   - Use Supabase or managed Postgres.
   - Ensure `mock_auth_users` schema matches application expectations (`auth_id` column when used).
   - If renaming columns, update any triggers/functions to use the new column names (e.g. `new.auth_id`).

3. Frontend
   - Build with `npm run build` inside `frontend/`.
   - Serve static assets from a CDN or static hosting (Netlify/Vercel) and point API requests to backend.

4. CI
   - Run backend tests with `python manage.py test`.
   - Run frontend build to ensure no regressions.
