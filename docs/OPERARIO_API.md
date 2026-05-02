# Operario API Documentation - v1.2.1

Base URL: `http://localhost:8000/api/operario/`

All endpoints require a valid JWT token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

## Response Format

All responses follow this structure:

**Success (2xx):**
```json
{
  "success": true,
  "data": {},
  "pagination": {
    "page": 1,
    "page_size": 10,
    "total_count": 100,
    "total_pages": 10,
    "has_next": true,
    "has_prev": false
  }
}
```

**Error (4xx/5xx):**
```json
{
  "success": false,
  "error": "Description of error"
}
```

## Municipios Endpoints

### GET /municipios/
List all active municipalities.

**Query Parameters:**
- `include_inactive` (bool): Include inactive municipalities (default: false)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "m1",
      "nombre": "Medellín",
      "activo": true
    }
  ],
  "count": 7
}
```

**Status Codes:** 200 OK, 500 Internal Server Error

---

### GET /municipios/{municipio_id}/
Get municipality detail with client statistics.

**Path Parameters:**
- `municipio_id` (string): Municipality ID

**Response:**
```json
{
  "success": true,
  "data": {
    "municipio": {
      "id": "m1",
      "nombre": "Medellín",
      "activo": true
    },
    "total_clientes": 5,
    "saldo_total": "1500000.00"
  }
}
```

**Status Codes:** 200 OK, 404 Not Found, 500 Internal Server Error

---

## Cartera (Clientes) Endpoints

### GET /clientes/
List all clients with pagination and filtering.

**Query Parameters:**
- `page` (int): Page number (default: 1)
- `page_size` (int): Items per page (default: 10)
- `search` (string): Search by name, cedula, or email
- `municipio_id` (string): Filter by municipality
- `activo` (bool): Filter by active status (default: true)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "c1",
      "nombre": "María González",
      "cedula": "1234567890",
      "telefono": "312 456 7890",
      "email": "maria@email.com",
      "municipio_nombre": "Medellín",
      "saldo_total": "280000.00",
      "deudas_atrasadas_count": 0,
      "activo": true,
      "fecha_registro": "2026-01-05"
    }
  ],
  "pagination": {
    "page": 1,
    "page_size": 10,
    "total_count": 15,
    "total_pages": 2,
    "has_next": true,
    "has_prev": false
  }
}
```

**Status Codes:** 200 OK, 400 Bad Request, 500 Internal Server Error

---

### GET /clientes/{cliente_id}/
Get detailed client information with all debts.

**Path Parameters:**
- `cliente_id` (string): Client ID

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "c1",
    "nombre": "María González",
    "cedula": "1234567890",
    "sexo": "F",
    "telefono": "312 456 7890",
    "telefono_alterno": "604 123 4567",
    "municipio_nombre": "Medellín",
    "direccion_casa": "Calle 50 #45-32, Laureles",
    "direccion_trabajo": "Carrera 70 #44-10, Oficina 302",
    "email": "maria@email.com",
    "info_extra": "Cliente confiable...",
    "fecha_registro": "2026-01-05",
    "activo": true,
    "saldo_total": "280000.00",
    "deudas": [
      {
        "id": "d1",
        "monto": "500000.00",
        "interes_mensual": "10.00",
        "descripcion": "Gastos médicos urgentes",
        "fecha_inicio": "2026-01-05",
        "fecha_vencimiento": "2026-07-05",
        "estado": "activa",
        "saldo_pendiente": "280000.00",
        "interes_acumulado": "50000.00",
        "abonos": [
          {
            "id": "a1",
            "monto": "100000.00",
            "fecha": "2026-02-05",
            "notas": "Abono quincenal",
            "atrasado": false,
            "created_at": "2026-01-05T10:00:00Z"
          }
        ],
        "created_at": "2026-01-05T10:00:00Z"
      }
    ]
  }
}
```

**Status Codes:** 200 OK, 404 Not Found, 500 Internal Server Error

---

## Deudas Endpoints

### GET /deudas/
List all debts with filtering.

**Query Parameters:**
- `page` (int): Page number (default: 1)
- `page_size` (int): Items per page (default: 10)
- `cliente_id` (string): Filter by client
- `estado` (string): Filter by status (activa/pagada/atrasada/cancelada)
- `atrasadas_only` (bool): Show only overdue debts (default: false)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "d1",
      "monto": "500000.00",
      "interes_mensual": "10.00",
      "descripcion": "Gastos médicos urgentes",
      "fecha_inicio": "2026-01-05",
      "fecha_vencimiento": "2026-07-05",
      "estado": "activa",
      "saldo_pendiente": "280000.00",
      "interes_acumulado": "50000.00",
      "abonos": [],
      "created_at": "2026-01-05T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "page_size": 10,
    "total_count": 24,
    "total_pages": 3,
    "has_next": true,
    "has_prev": false
  }
}
```

**Status Codes:** 200 OK, 400 Bad Request, 500 Internal Server Error

---

### GET /deudas/{deuda_id}/
Get detailed debt information with all payments.

**Path Parameters:**
- `deuda_id` (string): Debt ID

**Response:** Same as single debt object from list endpoint

**Status Codes:** 200 OK, 404 Not Found, 500 Internal Server Error

---

## Estadísticas Endpoints

### GET /stats/dashboard/
Get complete dashboard statistics.

**Response:**
```json
{
  "success": true,
  "data": {
    "total_clientes": 15,
    "clientes_activos": 15,
    "total_capital_prestado": "4600000.00",
    "total_capital_recuperado": "900000.00",
    "total_saldo_pendiente": "3700000.00",
    "total_intereses_generados": "450000.00",
    "deudas_activas": 18,
    "deudas_atrasadas": 2,
    "deudas_pagadas": 6,
    "tasa_cumplimiento": "88.89",
    "municipios_cubiertos": 7
  }
}
```

**Status Codes:** 200 OK, 500 Internal Server Error

---

### GET /stats/municipios/
Get statistics grouped by municipality.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "municipio_id": "m1",
      "municipio_nombre": "Medellín",
      "total_clientes": 5,
      "saldo_total": "1500000.00"
    },
    {
      "municipio_id": "m2",
      "municipio_nombre": "Envigado",
      "total_clientes": 3,
      "saldo_total": "900000.00"
    }
  ],
  "count": 7
}
```

**Status Codes:** 200 OK, 500 Internal Server Error

---

### GET /stats/deudas/
Get statistics by debt status.

**Response:**
```json
{
  "success": true,
  "data": {
    "activas": 18,
    "pagadas": 6,
    "atrasadas": 2,
    "canceladas": 0,
    "total": 24
  }
}
```

**Status Codes:** 200 OK, 500 Internal Server Error

---

## Finanzas Personales Endpoints

### GET /finanzas-personales/summary/
Get operator's personal finances summary.

**Response:**
```json
{
  "success": true,
  "data": {
    "total_deudas_personales": "18500000.00",
    "total_pagado_personales": "1200000.00",
    "total_saldo_personales": "17300000.00",
    "deudas_personales_activas": 2,
    "tasa_cumplimiento_personales": "100.00"
  }
}
```

**Status Codes:** 200 OK, 500 Internal Server Error

---

### GET /finanzas-personales/deudas/
List operator's personal debts.

**Query Parameters:**
- `page` (int): Page number (default: 1)
- `page_size` (int): Items per page (default: 10)
- `estado` (string): Filter by status (activa/pagada/cancelada)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "dp1",
      "concepto": "Tarjeta de Crédito Bancolombia",
      "acreedor": "Bancolombia",
      "monto": "3500000.00",
      "interes_mensual": "2.00",
      "fecha_inicio": "2025-06-01",
      "fecha_vencimiento": "2026-06-01",
      "estado": "activa",
      "saldo_pendiente": "3150000.00",
      "pagos": [
        {
          "id": "pp1",
          "monto": "350000.00",
          "fecha": "2025-07-01",
          "notas": "",
          "atrasado": false,
          "created_at": "2025-06-01T10:00:00Z"
        }
      ],
      "created_at": "2025-06-01T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "page_size": 10,
    "total_count": 2,
    "total_pages": 1,
    "has_next": false,
    "has_prev": false
  }
}
```

**Status Codes:** 200 OK, 400 Bad Request, 500 Internal Server Error

---

### GET /finanzas-personales/deudas/{deuda_personal_id}/
Get personal debt detail with payments.

**Path Parameters:**
- `deuda_personal_id` (string): Personal debt ID

**Response:** Same as single deuda personal object from list endpoint

**Status Codes:** 200 OK, 404 Not Found, 500 Internal Server Error

---

## Error Codes

| Code | Meaning | Example |
|------|---------|---------|
| 200 | OK | Request successful |
| 400 | Bad Request | Invalid pagination parameters |
| 401 | Unauthorized | Missing or invalid JWT token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource does not exist |
| 500 | Internal Server Error | Database error, server crash |

---

## Pagination

All list endpoints support pagination via query parameters:

```
GET /clientes/?page=1&page_size=20
```

Pagination info in response:
```json
{
  "pagination": {
    "page": 1,
    "page_size": 20,
    "total_count": 150,
    "total_pages": 8,
    "has_next": true,
    "has_prev": false
  }
}
```

---

## Data Types

- **Decimal fields** (monto, saldo_pendiente): Returned as strings to prevent precision loss
- **Dates**: ISO 8601 format (YYYY-MM-DD)
- **DateTimes**: ISO 8601 format with timezone (YYYY-MM-DDTHH:MM:SSZ)
- **Booleans**: true/false (lowercase)
- **IDs**: String (Supabase-compatible format)

---

## Search & Filtering

### Full-Text Search
Clientes can be searched by name, cedula, or email:
```
GET /clientes/?search=María
GET /clientes/?search=1234567890
GET /clientes/?search=maria@email.com
```

### Combined Filters
Multiple filters can be combined:
```
GET /clientes/?search=Maria&municipio_id=m1&activo=true&page=1&page_size=20
```

### Date Range Filtering (Future Enhancement)
```
GET /deudas/?fecha_inicio_min=2026-01-01&fecha_inicio_max=2026-12-31
```

---

## Performance Tips

1. **Use pagination** to limit data transfers
2. **Filter by municipality** to reduce dataset size
3. **Search specific fields** (name, cedula) instead of loading all clients
4. **Cache dashboard stats** on frontend (update every 5 minutes)
5. **Use `atrasadas_only=true`** to get overdue debts efficiently

---

## Examples

### Get all active clients in a municipality
```bash
curl -H "Authorization: Bearer <token>" \
  http://localhost:8000/api/operario/clientes/?municipio_id=m1&activo=true
```

### Get dashboard stats
```bash
curl -H "Authorization: Bearer <token>" \
  http://localhost:8000/api/operario/stats/dashboard/
```

### Search client by name
```bash
curl -H "Authorization: Bearer <token>" \
  http://localhost:8000/api/operario/clientes/?search=María&page_size=5
```

### Get overdue debts
```bash
curl -H "Authorization: Bearer <token>" \
  http://localhost:8000/api/operario/deudas/?atrasadas_only=true
```

### Get client details with all debts
```bash
curl -H "Authorization: Bearer <token>" \
  http://localhost:8000/api/operario/clientes/c1/
```
