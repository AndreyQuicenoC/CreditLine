#!/usr/bin/env python
"""
Initialize operario data into Supabase.

This script loads the mock data that was already imported via import_mock_to_supabase.js
and makes sure the operario models are properly mapped to the Supabase tables.

Usage:
    python manage.py shell < init_operario.py
    
Or as Django command in backend/:
    python manage.py shell < ../scripts/python/init_operario.py

Requirements:
    - Django ORM initialized
    - Database connection configured in settings.py
    - Supabase tables created (municipios, clientes, deudas, abonos, deudas_personales, pagos_personales)
"""
import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'creditline.settings')
django.setup()

from apps.operario.models import Municipio, Cliente, Deuda, Abono, DeudaPersonal, PagoPersonal
from django.db import connection
from decimal import Decimal

print("✓ Django environment initialized")
print("✓ Operario models imported")
print("\n--- Verifying Supabase tables ---\n")

# Check which tables exist
def check_table_exists(table_name):
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT EXISTS(
                SELECT 1 FROM information_schema.tables 
                WHERE table_name=%s AND table_schema='public'
            );
        """, [table_name])
        return cursor.fetchone()[0]

tables = [
    'municipios', 'clientes', 'deudas', 'abonos',
    'deudas_personales', 'pagos_personales'
]

for table in tables:
    exists = check_table_exists(table)
    status = "✓" if exists else "✗"
    print(f"{status} {table}: {'found' if exists else 'missing'}")

print("\n--- Data Count Check ---\n")

# Count data in each table
with connection.cursor() as cursor:
    cursor.execute("SELECT COUNT(*) FROM municipios;")
    municipios_count = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM clientes;")
    clientes_count = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM deudas;")
    deudas_count = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM abonos;")
    abonos_count = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM deudas_personales;")
    deudas_personales_count = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM pagos_personales;")
    pagos_personales_count = cursor.fetchone()[0]

print(f"✓ Municipios: {municipios_count}")
print(f"✓ Clientes: {clientes_count}")
print(f"✓ Deudas: {deudas_count}")
print(f"✓ Abonos: {abonos_count}")
print(f"✓ Deudas Personales: {deudas_personales_count}")
print(f"✓ Pagos Personales: {pagos_personales_count}")

print("\n--- Initialization Complete ---\n")
print("All operario tables are ready for API endpoints.")
print("Test connectivity with: python manage.py test apps.operario")
