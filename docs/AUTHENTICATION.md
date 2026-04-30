# Autenticación JWT - Sistema CreditLine

## Resumen de Cambios

Se corrigió un problema crítico en la autenticación JWT que impedía que los tokens fueran reconocidos por el backend. El problema era una **inconsistencia en las claves de localStorage**.

### Problema Original

- `api.ts` buscaba el token en `"token"`
- `authAPI.ts` guardaba el token en `"token"`
- `AuthContext.tsx` guardaba/leía del token en `"creditline_token"`
- **Resultado**: El API client nunca encontraba el token almacenado

### Solución Implementada

#### 1. Estandarización de Claves de localStorage

- **Clave única**: `"creditline_token"`
- Se actualizaron todos los servicios para usar esta clave consistentemente

**Archivos modificados:**

- `api.ts`: Ahora busca `"creditline_token"`
- `authAPI.ts`: Ahora almacena en `"creditline_token"`

#### 2. Nuevo Módulo `usersAPI.ts`

Servicio centralizado para todas las operaciones de usuarios:

```typescript
export const usersAPI = {
  listUsers(),      // Obtener lista de usuarios
  createUser(),     // Crear nuevo usuario
  updateUser(),     // Actualizar usuario
  deleteUser(),     // Eliminar usuario
  getSystemConfig(), // Obtener configuración
  updateSystemConfig() // Actualizar configuración
}
```

**Ventajas:**

- Código DRY (No Repetición)
- Logging centralizado
- Manejo de errores consistente
- Tipado TypeScript completo

#### 3. Token con Expiración (1 hora)

El token ahora se almacena con timestamp:

```typescript
{
  token: "eyJhbGciOiJIUzI1NiIs...",
  timestamp: 1234567890000  // Milliseconds since epoch
}
```

Se valida en cada petición:

- Si ha pasado > 1 hora: se limpia localStorage y redirige a login
- Si es válido: se envía normalmente

#### 4. Logs Mejorados

Se agregaron logs en:

- **Backend**: `authentication.py` - Detalles de validación JWT
- **Backend**: `views.py` - Login, listUsers, etc.
- **Frontend**: `usersAPI.ts` - Operaciones de usuarios
- **Frontend**: `Administracion.tsx` - Acciones de admin

**Logs sin información sensible:**

```
✓ JWT authentication successful for user=admin@creditline.com, role=ADMIN
✓ Login successful for user=admin@creditline.com, role=ADMIN
✓ list_users: admin=admin@creditline.com fetched 5 users
```

## Arquitectura de Autenticación

### Flujo de Autenticación

```
┌─────────────────────────────────────────────────────┐
│ 1. Usuario ingresa email/password en Login.tsx     │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│ 2. AuthContext.login() hace POST a /api/users/login/ │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│ 3. Backend genera JWT token (1 hora de expiración) │
│    y devuelve { token, user }                       │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│ 4. authAPI.login() almacena:                        │
│    - localStorage["creditline_token"] = {token, ts} │
│    - localStorage["creditline_user"] = user         │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│ 5. API client (api.ts) obtiene el token             │
│    y lo envía en header Authorization: Bearer ...  │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│ 6. Backend valida JWT con JWTAuthentication         │
│    - Verifica firma (SECRET_KEY)                    │
│    - Verifica expiración                            │
│    - Obtiene user del payload                       │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│ 7. Vista protegida procesa la petición              │
└─────────────────────────────────────────────────────┘
```

### Token Payload

```json
{
  "sub": "uuid-del-usuario",
  "email": "usuario@example.com",
  "iat": 1234567890,
  "exp": 1234571490
}
```

- `sub`: Subject (user_id)
- `email`: Email del usuario
- `iat`: Issued At (timestamp creación)
- `exp`: Expiration (timestamp expiración = iat + 3600 segundos)

## Endpoints Disponibles

### Autenticación

#### POST `/api/users/login/`

```bash
curl -X POST http://localhost:8000/api/users/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@creditline.com",
    "password": "admin123"
  }'
```

**Response:**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "auth_id": "uuid",
    "nombre": "Admin",
    "email": "admin@creditline.com",
    "rol": "ADMIN",
    "is_active": true,
    "ultimo_acceso": "2024-04-30T10:00:00Z"
  },
  "message": "Sesión iniciada correctamente"
}
```

### Usuarios (Requieren Autenticación)

#### GET `/api/users/list/`

Solo administradores. Retorna lista de todos los usuarios.

```bash
curl -H "Authorization: Bearer {token}" \
  http://localhost:8000/api/users/list/
```

#### POST `/api/users/create/`

Solo administradores. Crea nuevo usuario.

```bash
curl -X POST \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Nuevo Usuario",
    "email": "nuevo@example.com",
    "rol": "OPERARIO",
    "password": "password123"
  }' \
  http://localhost:8000/api/users/create/
```

#### PUT `/api/users/profile/update/`

Actualiza perfil del usuario autenticado.

```bash
curl -X PUT \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"nombre": "Nuevo Nombre"}' \
  http://localhost:8000/api/users/profile/update/
```

#### DELETE `/api/users/{user_id}/delete/`

Solo administradores. Elimina un usuario.

```bash
curl -X DELETE \
  -H "Authorization: Bearer {token}" \
  http://localhost:8000/api/users/{user_id}/delete/
```

### Configuración del Sistema (Requieren Autenticación)

#### GET `/api/users/system-config/`

Obtiene configuración (solo admin).

```bash
curl -H "Authorization: Bearer {token}" \
  http://localhost:8000/api/users/system-config/
```

#### PUT `/api/users/system-config/update/`

Actualiza configuración (solo admin).

```bash
curl -X PUT \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "tasa_interes": 12.5,
    "impuesto_retraso": 5.0
  }' \
  http://localhost:8000/api/users/system-config/update/
```

## Usuarios de Prueba

| Email                   | Contraseña  | Rol      | Notas                   |
| ----------------------- | ----------- | -------- | ----------------------- |
| admin@creditline.com    | admin123    | ADMIN    | Acceso total al sistema |
| operario@creditline.com | operario123 | OPERARIO | Acceso limitado         |

## Codes de Error

### 400 Bad Request

- Datos faltantes o inválidos
- Email duplicado en creación de usuario
- Contraseña muy corta

### 401 Unauthorized

- Credenciales incorrectas en login
- Token expirado
- Token inválido
- Sin header Authorization

### 403 Forbidden

- Usuario no es administrador
- Intento de operación no permitida

### 404 Not Found

- Usuario o recurso no existe

### 500 Internal Server Error

- Error en el servidor
- Problema de conectividad con BD

## Testing

### Ejecutar pruebas de API

```bash
cd CreditLine/backend
python ../scripts/test_api.py
```

### Verificar JWT en manualmente

```bash
python manage.py shell

import jwt
from django.conf import settings

token = "your-token-here"
decoded = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
print(decoded)
```

## Troubleshooting

### Error: 401 Unauthorized al llamar API protegido

**Causas comunes:**

1. Token no está en localStorage
   - Verificar que login fue exitoso
   - Ver si `localStorage.getItem("creditline_token")` retorna algo

2. Token expirado
   - Hacer logout y login de nuevo

3. Header Authorization incorrecto
   - Debe ser: `Authorization: Bearer {token}`
   - No: `Authorization: {token}`

### Error: CORS issues

Verificar que:

1. Backend tiene `CORS_ALLOWED_ORIGINS` correcto
2. Frontend hace requests a URL configurada en `VITE_API_URL`

### Error: 403 Forbidden en /api/users/list/

- Verificar que usuario es ADMIN
- Ver en logs: `list_users: unauthorized access attempt`

## Notas de Seguridad

⚠️ **DESARROLLO SOLAMENTE:**

- Secret key está en código (`django-insecure-...`)
- Contraseñas almacenadas en tabla `mock_auth_users`
- JWT solo protege transmisión, no almacenamiento

🔐 **PRODUCCIÓN (TODO):**

- Usar variables de entorno para SECRET_KEY
- Usar Supabase Auth para gestión de usuarios
- Implementar refresh tokens
- HTTPS obligatorio
- Secure cookies
- Rate limiting en login
