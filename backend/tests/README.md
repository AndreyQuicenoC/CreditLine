# Backend Tests

Este directorio contiene los tests automatizados para la API backend de CreditLine.

## Estructura

- `conftest.py`: Fixtures compartidas para todos los tests
- `test_auth.py`: Tests de autenticación (login, get_profile, update_profile)
- `test_users.py`: Tests de gestión de usuarios (create, edit, list, delete)
- `test_system_config.py`: Tests de configuración del sistema

## Requisitos

```bash
pip install pytest pytest-django djangorestframework
```

## Ejecutar Tests

### Todos los tests
```bash
pytest
```

### Tests específicos
```bash
# Solo tests de autenticación
pytest tests/test_auth.py

# Una prueba específica
pytest tests/test_auth.py::TestAuthentication::test_login_success

# Con verbosidad
pytest -v

# Con coverage
pip install pytest-cov
pytest --cov=apps --cov-report=html
```

### Tests con reportes
```bash
# Generar reporte HTML
pytest --html=report.html --self-contained-html

# Generar JUnit XML (para CI/CD)
pytest --junitxml=test-results.xml
```

## Escritura de Tests

### Usar fixtures
```python
@pytest.mark.django_db
def test_something(admin_token, admin_user):
    # admin_token es un JWT válido
    # admin_user es un usuario admin creado en la BD de test
    pass
```

### Fixtures disponibles
- `admin_user`: Usuario admin en la BD
- `operario_user`: Usuario operario en la BD
- `admin_token`: Token JWT del admin
- `operario_token`: Token JWT del operario

## CI/CD Integration

Estos tests están diseñados para correr en pipelines de CI/CD:

```yaml
# GitHub Actions example
- name: Run tests
  run: pytest --junitxml=test-results.xml

- name: Upload results
  uses: actions/upload-artifact@v2
  with:
    name: test-results
    path: test-results.xml
```

## Notas

- Los tests usan una BD de test separada
- Se limpian automáticamente después de cada test
- Los tests requieren que las tablas estén creadas (ver init_supabase.sql)
- En CI/CD, asegurarse de ejecutar las migraciones primero
