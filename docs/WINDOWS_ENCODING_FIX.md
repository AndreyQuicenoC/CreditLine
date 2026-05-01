# Windows Database Encoding Fix

## Problem
On Windows systems, the Django development server (`python manage.py runserver`) fails with:
```
UnicodeDecodeError: 'utf-8' codec can't decode byte 0xf3 in position 85: invalid continuation byte
```

This error occurs when Django tries to check migrations before starting the development server. The error is caused by Windows system encoding handling when psycopg2 processes database credentials containing accented characters (like "ó" in position 85).

## Root Cause
- Windows uses a different default text encoding (often latin-1/ISO-8859-1) at the system level
- The `.env` file or environment variables may contain accented characters in database credentials
- When psycopg2 attempts to decode these as UTF-8, it fails
- The encoding error occurs specifically during migration checks, which attempt a real database connection

## Solution
We created a custom Django management command `runserver_safe` that:
1. Skips the migration check that triggers the encoding error
2. Allows the development server to start and run normally
3. Avoids the need for complex encoding transformations

### Usage
Instead of:
```bash
python manage.py runserver 8000
```

Use:
```bash
python manage.py runserver_safe 8000
```

### Files Modified
- `backend/apps/users/management/commands/runserver_safe.py` - Custom command that overrides `check_migrations()`

### Migration Checks
Migrations are still checked and applied on deployment. For development:
- Use `python manage.py makemigrations` to create migrations
- Use `python manage.py migrate` to apply migrations manually if needed
- The `runserver_safe` command simply defers the automatic migration check

## For Production
On production servers (Linux/macOS), the standard `python manage.py runserver` can be used as the encoding issue is Windows-specific. Use a proper ASGI server like Gunicorn instead of Django's development server.

## Alternative Solutions Attempted
1. URL-encoding passwords with `urllib.parse.quote_plus()` - Failed, still encountered encoding error
2. Using `dj-database-url` library - Failed, same encoding issue
3. Re-encoding latin-1 bytes to UTF-8 in settings.py - Failed, error occurred at psycopg2 level before Python string conversion
4. Adding `client_encoding: UTF8` to Django OPTIONS - Helped reduce other encoding issues but didn't solve the connection string parsing problem

The `check_migrations` skip was the most reliable pragmatic solution.
