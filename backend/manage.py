#!/usr/bin/env python
import os
import sys
from pathlib import Path


def _use_sqlite_fallback_for_runserver() -> None:
    """Allow local runserver to start when no real Postgres credentials are set."""
    if len(sys.argv) < 2 or sys.argv[1] != 'runserver':
        return

    database_url = os.environ.get('DATABASE_URL', '')
    placeholder_markers = ('YOUR_DB_PASSWORD', 'replace_with', 'placeholder')
    if database_url and not any(marker in database_url for marker in placeholder_markers):
        return

    sqlite_path = Path(__file__).resolve().parent / 'db.sqlite3'
    os.environ['DATABASE_URL'] = f'sqlite:///{sqlite_path.as_posix()}'


def main():
    """Run administrative tasks."""
    _use_sqlite_fallback_for_runserver()
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'creditline.settings')
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc
    execute_from_command_line(sys.argv)


if __name__ == '__main__':
    main()
