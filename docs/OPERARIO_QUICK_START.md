# Operario API Quick Start - v1.2.1

## Base URL
```
http://localhost:8000/api/operario/
```

## Authentication
All requests require a JWT token in the header:
```
Authorization: Bearer <jwt_token>
```

Get token from login endpoint:
```bash
POST /api/users/login/
{
  "email": "operario@example.com",
  "password": "password123"
}
```

## Common cURL Examples

### 1. Get Dashboard Statistics
```bash
curl -H "Authorization: Bearer <token>" \
  http://localhost:8000/api/operario/stats/dashboard/
```

Response includes:
- total_clientes, clientes_activos
- total_capital_prestado, total_capital_recuperado
- total_saldo_pendiente, total_intereses_generados
- deudas_activas, deudas_atrasadas, deudas_pagadas
- tasa_cumplimiento, municipios_cubiertos

### 2. List All Clients
```bash
curl -H "Authorization: Bearer <token>" \
  "http://localhost:8000/api/operario/clientes/?page=1&page_size=10"
```

### 3. Search Clients
```bash
curl -H "Authorization: Bearer <token>" \
  "http://localhost:8000/api/operario/clientes/?search=María"
```

### 4. Filter Clients by Municipality
```bash
curl -H "Authorization: Bearer <token>" \
  "http://localhost:8000/api/operario/clientes/?municipio_id=m1"
```

### 5. Get Client Details (with all debts)
```bash
curl -H "Authorization: Bearer <token>" \
  http://localhost:8000/api/operario/clientes/c1/
```

### 6. Get All Debts
```bash
curl -H "Authorization: Bearer <token>" \
  "http://localhost:8000/api/operario/deudas/?page=1&page_size=10"
```

### 7. Get Overdue Debts
```bash
curl -H "Authorization: Bearer <token>" \
  "http://localhost:8000/api/operario/deudas/?atrasadas_only=true"
```

### 8. Get Statistics by Municipality
```bash
curl -H "Authorization: Bearer <token>" \
  http://localhost:8000/api/operario/stats/municipios/
```

### 9. Get Debt Status Breakdown
```bash
curl -H "Authorization: Bearer <token>" \
  http://localhost:8000/api/operario/stats/deudas/
```

### 10. Get Personal Finances Summary
```bash
curl -H "Authorization: Bearer <token>" \
  http://localhost:8000/api/operario/finanzas-personales/summary/
```

### 11. List Personal Debts
```bash
curl -H "Authorization: Bearer <token>" \
  "http://localhost:8000/api/operario/finanzas-personales/deudas/?page=1&page_size=10"
```

### 12. List Municipalities
```bash
curl -H "Authorization: Bearer <token>" \
  http://localhost:8000/api/operario/municipios/
```

## Response Format

### Success (200 OK)
```json
{
  "success": true,
  "data": { /* endpoint-specific data */ },
  "pagination": { /* only for list endpoints */ }
}
```

### Error (400-500)
```json
{
  "success": false,
  "error": "Description of the error"
}
```

## Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 400 | Bad request (invalid params) |
| 401 | Unauthorized (no/invalid token) |
| 404 | Not found |
| 500 | Server error |

## Query Parameters

### Pagination
- `page`: Page number (default: 1)
- `page_size`: Items per page (default: 10)

### Filtering
- `search`: Search by name/cedula/email
- `municipio_id`: Filter by municipality
- `estado`: Filter by status (activa/pagada/atrasada/cancelada)
- `activo`: Filter by active status (true/false)
- `atrasadas_only`: Show only overdue (true/false)

### Examples
```bash
# Combine filters
curl -H "Authorization: Bearer <token>" \
  "http://localhost:8000/api/operario/clientes/?search=Maria&municipio_id=m1&page_size=20"

# Get overdue debts for specific client
curl -H "Authorization: Bearer <token>" \
  "http://localhost:8000/api/operario/deudas/?cliente_id=c1&estado=activa&atrasadas_only=true"
```

## Data Types in Responses

- **Monetary amounts** (monto, saldo): String (e.g., "1500000.00")
- **Interest rates** (interes_mensual): String percentage (e.g., "12.00")
- **Dates**: ISO format (e.g., "2026-01-05")
- **DateTimes**: ISO format with timezone (e.g., "2026-01-05T10:00:00Z")
- **Booleans**: true/false (lowercase)
- **IDs**: String (e.g., "c1", "d1", "m1")

## Testing in Insomnia/Postman

1. Create new request collection
2. Add Bearer token to Authorization header (Bearer <token>)
3. Base URL: `http://localhost:8000/api/operario`
4. Test endpoints listed above

## Common Errors

| Error | Cause | Fix |
|-------|-------|-----|
| 401 Unauthorized | Missing/invalid token | Get valid token from login endpoint |
| 404 Not Found | Resource doesn't exist | Check ID exists in system |
| 400 Bad Request | Invalid pagination params | Ensure page/page_size are integers |
| 500 Internal Server Error | Server crash | Check backend logs |

## Performance Tips

1. **Use pagination** to limit data transfers (default 10 items)
2. **Filter by municipality** to reduce dataset
3. **Search specific fields** instead of loading all data
4. **Use atrasadas_only=true** to find overdue efficiently
5. **Cache dashboard stats** (update every 5 mins)

## Need More Info?

- Full API docs: See `docs/OPERARIO_API.md`
- Security: See `docs/OPERARIO_SECURITY_CHECKLIST.md`
- Implementation: See `docs/OPERARIO_IMPLEMENTATION.md`
- GitHub Issues: Report bugs/features on GitHub

---

**Version**: 1.2.1  
**Last Updated**: May 2, 2026
