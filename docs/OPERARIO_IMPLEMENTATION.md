# Operario Module Implementation Guide - v1.2.1

## Architecture Overview

The operario module implements a complete loan and personal finance management system following Django best practices and modular design principles.

### Module Structure

```
backend/apps/operario/
├── models.py              # Data models (Municipio, Cliente, Deuda, etc.)
├── serializers.py         # DRF serializers for API responses
├── views.py               # API view functions
├── urls.py                # URL routing configuration
├── apps.py                # Django app configuration
├── services/
│   └── __init__.py        # Business logic services
├── migrations/            # Database migrations (auto-generated)
└── __init__.py            # Package initialization
```

### Technology Stack

- **Framework**: Django 3.2+ with Django REST Framework
- **Database**: PostgreSQL via Supabase
- **Authentication**: JWT (via core.authentication.JWTAuthentication)
- **Serialization**: DRF with custom SerializerMethodField for calculations

## Data Models

### 1. Municipio
Represents geographic areas served by the operario.
- Primary Key: `id` (CharField, Supabase-compatible)
- Fields: nombre (unique), activo (indexed)
- Purpose: Filter clients and debts by geographic region

### 2. Cliente
Loan client/customer information.
- Primary Key: `id` (CharField)
- Relations: ForeignKey to Municipio (PROTECT)
- Key Fields: cedula (unique, indexed), email (indexed), fecha_registro
- Calculated Properties: saldo_total, deudas_atrasadas_count
- Purpose: Store customer data with contact information

### 3. Deuda
Loan/debt records.
- Primary Key: `id` (CharField)
- Relations: ForeignKey to Cliente (CASCADE)
- Key Fields: monto, interes_mensual, estado (indexed), fecha_vencimiento (indexed)
- Calculated Properties: saldo_pendiente, interes_acumulado
- Statuses: activa, pagada, atrasada, cancelada
- Purpose: Track debt obligations

### 4. Abono
Debt payments/installments.
- Primary Key: `id` (CharField)
- Relations: ForeignKey to Deuda (CASCADE)
- Key Fields: monto, fecha (indexed), atrasado
- Purpose: Track individual payments on debts

### 5. DeudaPersonal
Operator's personal debts (credit cards, loans, etc.).
- Primary Key: `id` (CharField)
- Key Fields: concepto, acreedor, monto, interes_mensual
- Calculated Properties: saldo_pendiente
- Purpose: Track operator's personal obligations

### 6. PagoPersonal
Operator's personal debt payments.
- Primary Key: `id` (CharField)
- Relations: ForeignKey to DeudaPersonal (CASCADE)
- Key Fields: monto, fecha (indexed), atrasado
- Purpose: Track operator's payment history

## API Endpoints Design

### Principle: Modular & RESTful
```
/municipios/                          # List municipalities
/municipios/{id}/                     # Get municipality + stats
/clientes/                            # List clients (with pagination/filtering)
/clientes/{id}/                       # Get client + all debts
/deudas/                              # List debts (with filtering)
/deudas/{id}/                         # Get debt + all payments
/stats/dashboard/                     # Aggregated statistics
/stats/municipios/                    # Stats per municipality
/stats/deudas/                        # Debt status breakdown
/finanzas-personales/summary/         # Personal finances summary
/finanzas-personales/deudas/          # List personal debts
/finanzas-personales/deudas/{id}/     # Get personal debt detail
```

### Query Parameters
- **Pagination**: `page`, `page_size` (default: 1, 10)
- **Filtering**: `search`, `municipio_id`, `estado`, `activo`
- **Sorting**: Handled at serializer level (can extend)

## Service Layer

The `services/__init__.py` module contains business logic:

### EstadisticasService
Handles dashboard and statistical calculations:
- `get_dashboard_stats()`: Full statistics summary
- `get_cartera_stats()`: Portfolio-specific stats
- `get_municipios_stats()`: Municipality breakdown
- `get_deudas_stats()`: Debt status distribution

**Design**: Separated from views for testability and reusability

### ClienteService
Client-specific operations:
- `get_cliente_with_stats()`: Client + calculated fields
- `get_clientes_by_municipio()`: Filtered queryset
- `search_clientes()`: Full-text search

### DeudaService
Debt operations:
- `get_deudas_activas()`: Active debts queryset
- `get_deudas_atrasadas()`: Overdue debts queryset
- `get_deuda_with_abonos()`: Debt with payment history

### FinanzasPersonalesService
Personal finance operations:
- `get_personal_finances_summary()`: Personal finance stats
- `get_personal_debts_by_status()`: Personal debts breakdown

## Security Implementation

### Authentication
- All endpoints require `@permission_classes([IsAuthenticated])`
- JWT token validation via custom authentication class
- Token includes: `sub` (user_id), `email`, `iat`, `exp`

### Authorization
- Role-based access control via UserProfile.rol
- Operario users see only their portfolio data (future multi-operario support)
- Admin users manage operario records

### Input Validation
1. **Serializer-level**: DRF validators on all input fields
2. **Query parameter-level**: Type checking and sanitization
3. **Database-level**: Model validators (MinValueValidator, unique constraints)

### Query Safety
- No raw SQL queries
- All queries use Django ORM QuerySet API
- No string concatenation in filters
- Parameterized queries via F() and Q() expressions

### Data Protection
- Sensitive data (cedula) indexed but not logged
- Error responses don't leak internal details
- CORS configured to allow only approved origins
- CSRF protection via Django middleware

## Calculated Properties

Properties are calculated at the model and serializer level:

### Model Level (for view logic)
```python
@property
def saldo_pendiente(self):
    """Calculated in-memory, used by services"""
    pagado = self.abonos_set.aggregate(total=Sum('monto'))['total'] or 0
    return float(self.monto) - pagado
```

### Serializer Level (for API responses)
```python
def get_saldo_pendiente(self, obj):
    """Serialized to string (Decimal precision)"""
    return str(obj.saldo_pendiente)
```

This dual approach ensures:
1. Accuracy (database queries where needed)
2. Precision (Decimal to string conversion for JSON)
3. Performance (calculations at appropriate layer)

## Pagination & Performance

### Pagination Strategy
```python
paginator = Paginator(queryset, page_size)
page_obj = paginator.get_page(page)
```

### Query Optimization
1. Use `select_related()` for foreign keys (future)
2. Use `prefetch_related()` for reverse relations (future)
3. Indexes on frequently queried fields (municipio, cliente, estado, fecha)
4. Distinct() used when filtering many-to-many joins

### Caching Opportunities
- Dashboard stats (update every 5 minutes)
- Municipio list (rarely changes)
- Client search (use database full-text search for scale)

## Error Handling

All views implement try-catch with logging:

```python
try:
    # Business logic
except SpecificException:
    return Response({'error': 'User-friendly message'}, status=400)
except Exception as e:
    logger.error(f"Detailed error: {str(e)}")
    return Response({'error': 'Internal server error'}, status=500)
```

Benefits:
- No stack traces exposed to clients
- Detailed logs for debugging
- Graceful degradation

## Future Enhancements

1. **Multi-Operario Support**: Filter data by current user
2. **Batch Operations**: Create/update multiple records
3. **Export/Reports**: Generate PDF/Excel reports
4. **Webhooks**: Notify on debt status changes
5. **Notifications**: Alert operator of overdue payments
6. **Audit Trail**: Track all data modifications
7. **API Versioning**: Support multiple API versions
8. **Rate Limiting**: Prevent abuse
9. **Caching**: Redis for performance
10. **GraphQL**: Alternative to REST

## Testing Strategy

### Unit Tests (Not yet implemented)
- Test service methods in isolation
- Mock database queries
- Test serializer validation

### Integration Tests
- Test full API endpoint flow
- Use test fixtures with mock data
- Verify correct status codes and response format

### Performance Tests
- Load test pagination
- Test with large datasets
- Monitor query count per request

## Deployment Checklist

- [ ] Run migrations: `python manage.py migrate apps.operario`
- [ ] Collect static files: `python manage.py collectstatic`
- [ ] Run security checks: `python manage.py check --deploy`
- [ ] Test in staging: Full API test suite
- [ ] Monitor logs post-deployment
- [ ] Set up alerts for 5xx errors
- [ ] Configure rate limiting
- [ ] Set up backup and recovery procedures

## Maintenance

### Adding New Endpoint
1. Add method to views.py
2. Add URL pattern to urls.py
3. Create serializer if needed
4. Document in OPERARIO_API.md
5. Add tests (when test suite is set up)
6. Commit with descriptive message

### Modifying Models
1. Update models.py
2. Create migration: `python manage.py makemigrations apps.operario`
3. Apply migration: `python manage.py migrate apps.operario`
4. Update related serializers
5. Update API documentation

### Debugging Tips
- Check logs for error details
- Use Django shell: `python manage.py shell`
- Test queries in shell: `from apps.operario.models import *`
- Use Postman/Insomnia for API testing with token

## Code Style

- Python: PEP 8 compliant
- Django: Official Django style guide
- Docstrings: Google style format
- Comments: Explain "why" not "what"
- Variables: Descriptive names (e.g., `deudas_activas` not `da`)

## Dependencies

- django >= 3.2
- djangorestframework >= 3.12
- python-decouple (for environment variables)
- psycopg2-binary (PostgreSQL adapter)
- supabase-py (optional, for admin operations)

## Support & Documentation

- **API Docs**: See [OPERARIO_API.md](OPERARIO_API.md)
- **Security**: See [OPERARIO_SECURITY_CHECKLIST.md](OPERARIO_SECURITY_CHECKLIST.md)
- **Django Docs**: https://docs.djangoproject.com/
- **DRF Docs**: https://www.django-rest-framework.org/

---

**Last Updated**: 2026-05-02  
**Version**: 1.2.1  
**Maintainer**: ClustLayer Engineering Team
