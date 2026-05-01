"""
Custom runserver command that skips migration checks for encoding issues.
Use: python manage.py runserver_safe 8000
"""
from django.core.management.commands.runserver import Command as RunServerCommand


class Command(RunServerCommand):
    def check_migrations(self):
        """Override to skip migration checks (avoids encoding errors on Windows)."""
        self.stdout.write(self.style.HTTP_INFO("Skipping migration checks (Windows encoding issue)..."))
        # Don't call super() - skip the migration check entirely


