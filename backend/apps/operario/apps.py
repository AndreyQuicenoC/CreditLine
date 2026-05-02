"""
Operario App Configuration

Main application configuration for operario module.
Handles loan management and operator finance tracking.
"""
from django.apps import AppConfig


class OperarioConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.operario'
    verbose_name = 'Operario (Loan Management)'
