# CreditLine API Documentation

**Base URL**: `http://localhost:8000/api`

**Authentication**: All endpoints require a valid Supabase JWT token in the `Authorization` header.

```
Authorization: Bearer <supabase_jwt_token>
```

---

## Endpoints

### Users

#### Get User Profile

- **Endpoint**: `GET /users/profile/`
- **Description**: Get the authenticated user's profile
- **Authentication**: Required (Bearer token)
- **Response**:

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "auth_id": "550e8400-e29b-41d4-a716-446655440001",
  "email": "admin@creditline.com",
  "nombre": "Admin Principal",
  "rol": "ADMIN",
  "is_active": true,
  "ultimo_acceso": "2026-04-29T14:30:00Z",
  "created_at": "2026-04-29T10:00:00Z",
  "updated_at": "2026-04-29T14:30:00Z"
}
```

**Status Codes**:

- `200 OK` - Profile retrieved successfully
- `401 Unauthorized` - Invalid or missing token
- `404 Not Found` - User profile not found

---

#### Update User Profile

- **Endpoint**: `PUT /users/profile/update/`
- **Description**: Update the authenticated user's profile
- **Authentication**: Required (Bearer token)
- **Request Body**:

```json
{
  "nombre": "New Name"
}
```

**Note**: Only `nombre` field can be updated by the user. Role and other fields are admin-only.

- **Response**: Same as Get Profile (updated data)

**Status Codes**:

- `200 OK` - Profile updated successfully
- `400 Bad Request` - Invalid data
- `401 Unauthorized` - Invalid or missing token
- `404 Not Found` - User profile not found

---

#### List All Users

- **Endpoint**: `GET /users/list/`
- **Description**: List all users (admin only)
- **Authentication**: Required (Bearer token, admin role)
- **Response**:

```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "auth_id": "550e8400-e29b-41d4-a716-446655440001",
    "email": "admin@creditline.com",
    "nombre": "Admin Principal",
    "rol": "ADMIN",
    "is_active": true,
    "ultimo_acceso": "2026-04-29T14:30:00Z",
    "created_at": "2026-04-29T10:00:00Z",
    "updated_at": "2026-04-29T14:30:00Z"
  }
]
```

**Status Codes**:

- `200 OK` - List retrieved successfully
- `401 Unauthorized` - Invalid or missing token
- `403 Forbidden` - User is not admin
- `404 Not Found` - User profile not found

---

## Error Responses

All error responses follow this format:

```json
{
  "error": "Error message describing what went wrong"
}
```

**Common Status Codes**:

- `400 Bad Request` - Invalid request data
- `401 Unauthorized` - Missing or invalid authentication
- `403 Forbidden` - User lacks permission for this action
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

---

## Authentication Flow

1. **Frontend**: User logs in via Supabase Auth
   - `supabase.auth.signInWithPassword(email, password)`
   - Returns JWT token

2. **Backend**: Validate JWT and fetch user profile
   - Frontend sends: `GET /api/users/profile/` with `Authorization: Bearer <token>`
   - Backend: Validates token, extracts user ID, fetches profile
   - Returns user profile data

3. **Session**: Supabase manages session automatically
   - Token refresh handled by Supabase SDK
   - No manual token management needed

---

## Rate Limiting

Currently no rate limiting implemented. Future versions will include:

- Per-user rate limits (to prevent abuse)
- Per-IP rate limits (to prevent DoS attacks)

---

## CORS

CORS is enabled for development. Allowed origins:

- `http://localhost:5173`
- `http://127.0.0.1:5173`

For production, update `CORS_ALLOWED_ORIGINS` in `settings.py`.

---

## Versioning

Current API Version: `v0.1.0`

No versioning prefix in URLs yet. Future versions may use `/api/v1/` pattern.

---

## Examples

### Login and Get Profile (JavaScript)

```javascript
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(URL, KEY);

// Login
const { data, error } = await supabase.auth.signInWithPassword({
  email: "admin@creditline.com",
  password: "admin123",
});

// Get JWT token from session
const {
  data: { session },
} = await supabase.auth.getSession();
const token = session?.access_token;

// Fetch profile
const response = await fetch("http://localhost:8000/api/users/profile/", {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

const profile = await response.json();
console.log(profile);
```

---

**Last Updated**: 2026-04-29  
**API Status**: Beta
