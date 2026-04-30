# CreditLine - Persistence Setup Complete

This document outlines all the changes made to implement user creation and configuration persistence in Supabase.

## Backend Endpoints Created

### User Management

1. **POST /api/users/create/**
   - Creates a new user with nombre, email, rol, and password
   - Admin-only operation
   - Returns created user profile
   - Validates all fields and stores password securely

2. **GET /api/users/list/**
   - Lists all users in the system
   - Admin-only operation
   - Returns array of user profiles

3. **DELETE /api/users/{user_id}/delete/**
   - Deletes a user by ID
   - Admin-only operation (cannot delete self)
   - Returns success message

4. **PUT /api/users/profile/update/**
   - Updates authenticated user's profile (nombre field only)
   - Works for any authenticated user
   - Returns updated profile

### System Configuration

1. **GET /api/users/system-config/**
   - Gets current system configuration
   - Admin-only operation
   - Returns: `{ tasa_interes: float, impuesto_retraso: float }`

2. **PUT /api/users/system-config/update/**
   - Updates system configuration
   - Admin-only operation
   - Accepts: `{ tasa_interes: float, impuesto_retraso: float }`
   - Validates values are between 0-100
   - Returns updated config

## Supabase Setup Required

Run the SQL script `scripts/create_system_config.sql` in Supabase SQL Editor:

```sql
CREATE TABLE IF NOT EXISTS system_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tasa_interes DECIMAL(5, 2) NOT NULL DEFAULT 10.0,
  impuesto_retraso DECIMAL(5, 2) NOT NULL DEFAULT 5.0,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Enable RLS and create policies...
-- See create_system_config.sql for full script
```

## Frontend Changes

### Administracion.tsx
- Added password field to user creation form
- Integrated all user management with backend API calls
- Integrated configuration management with backend API calls
- Added comprehensive error handling with toast notifications
- Loads users and configuration on component mount
- Removed mockData references ("Base de datos Local (mockData)" and "Crear Respaldo Ahora")

### Navbar.tsx
- Updated profile edit (handleSaveProfile) to persist changes to backend
- Calls PUT /api/users/profile/update/ with nombre field
- Shows success/error toast notifications

## Testing the System

### 1. Create Supabase Table
```
Go to: https://app.supabase.com
1. Select your CreditLine project
2. SQL Editor → New Query
3. Copy contents of scripts/create_system_config.sql
4. Run the query
```

### 2. Start Backend
```bash
cd backend
python manage.py runserver
# Server starts on http://localhost:8000
```

### 3. Start Frontend
```bash
cd frontend
npm run dev
# Dev server starts on http://localhost:5173
```

### 4. Test User Creation
1. Login as admin (admin@creditline.com / admin123)
2. Navigate to /administracion
3. Click "Nuevo Usuario"
4. Fill in:
   - Nombre: "Test User"
   - Correo: "test@example.com"
   - Rol: "OPERARIO"
   - Contraseña: "password123"
5. Click "Crear Usuario"
6. You should see a success toast and user appears in table
7. **Reload page** - user should still be there (now persisted in Supabase!)

### 5. Test User Deletion
1. In the users table, find the user you created
2. Click the red delete button
3. Click "Eliminar" in the confirmation dialog
4. User should be removed from table
5. Reload page - user should not reappear

### 6. Test Configuration Changes
1. In "Configuración General" section
2. Change Tasa de Interés to 12.5
3. Change Impuesto por Retraso to 6.0
4. Click "Guardar Configuración"
5. You should see a success toast
6. **Reload page** - values should still be 12.5 and 6.0 (persisted!)

### 7. Test Profile Update
1. Click the user icon (top right)
2. Click "Editar perfil"
3. Change the name to something new
4. Click "Guardar Cambios"
5. You should see a success toast
6. Reload page - the new name should appear in the navbar

### 8. Test Error Handling
Try these to verify error handling:
- Create user with empty email → Shows error toast
- Create user with invalid email → Shows error toast
- Create user with duplicate email → Shows error toast
- Create user with password < 6 chars → Shows error toast
- Try accessing admin endpoints as non-admin → Gets 403 error

## Database Schema

### system_config table
```sql
id (UUID) - Primary key
tasa_interes (DECIMAL 5,2) - Interest rate (10.0 default)
impuesto_retraso (DECIMAL 5,2) - Late fee percentage (5.0 default)
updated_at (TIMESTAMP) - When config was last updated
updated_by (UUID FK) - Admin who made the change
```

## API Response Examples

### Create User Success
```json
{
  "user": {
    "auth_id": "uuid",
    "nombre": "Juan",
    "email": "juan@example.com",
    "rol": "OPERARIO",
    "is_active": true,
    "ultimo_acceso": "2026-04-30T12:00:00Z"
  },
  "message": "Usuario \"Juan\" creado exitosamente"
}
```

### Create User Error
```json
{
  "email": "Este correo ya está registrado"
}
```

### Get System Config Success
```json
{
  "tasa_interes": 10.0,
  "impuesto_retraso": 5.0
}
```

### Unauthorized Error
```json
{
  "error": "Only admins can create users"
}
```

## Key Features

✅ **Persistent Storage**: All user creation/updates stored in Supabase  
✅ **Password Field**: User creation now requires a password (6+ chars)  
✅ **Error Handling**: Comprehensive validation with user-friendly error messages  
✅ **Toast Notifications**: Success/error feedback for all operations  
✅ **Admin-Only Operations**: User creation/deletion restricted to admin role  
✅ **Configuration Persistence**: System settings saved to Supabase  
✅ **Page Reload Safety**: Data persists on page refresh  
✅ **Profile Updates**: Users can edit their own profile and changes persist  

## Troubleshooting

### "No active session" error
- Make sure you're logged in
- Check that token is stored in localStorage
- Try logging out and logging back in

### "Only admins can..." error
- Make sure you're logged in as admin
- Try the action with admin account (admin@creditline.com)

### Users/config appear then disappear
- Make sure Supabase SQL script was executed
- Check browser console for error messages
- Verify backend server is running (http://localhost:8000)

### Toast notifications not showing
- Make sure you have Sonner library installed
- Check browser console for errors
- Reload the page and try again

## What Changed From Previous Version

| Feature | Before | After |
|---------|--------|-------|
| User creation | Local state only | Persisted to Supabase |
| Password field | Not required | Required (6+ chars) |
| Configuration | Mock values | Stored in system_config table |
| Profile updates | Not persisted | Saved to database |
| Error messages | Generic toast | Specific field-level errors |
| Page reload | Users disappear | Users persist |
| Mock data | Referenced | Completely removed |
| Backup button | Dummy toast | Removed |
