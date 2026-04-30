# CreditLine Database Schema

## Overview

CreditLine uses PostgreSQL (via Supabase) as the primary data store.

**Database**: `postgres` (Supabase)  
**Schema**: `public` and `auth` (Supabase Auth)

---

## Tables

### `auth.users` (Supabase Managed)

Managed by Supabase Auth. Stores authentication credentials.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | User ID (primary key) |
| `email` | VARCHAR | Email address (unique) |
| `encrypted_password` | VARCHAR | Hashed password (bcrypt/pbkdf2) |
| `email_confirmed_at` | TIMESTAMP | Email confirmation timestamp |
| `created_at` | TIMESTAMP | Account creation time |
| `updated_at` | TIMESTAMP | Last update time |

**Note**: Passwords are NEVER readable; always hashed. Authentication is handled entirely by Supabase Auth.

---

### `public.user_profiles`

Custom metadata for users. Created by trigger when user signs up.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Profile ID |
| `auth_id` | UUID | UNIQUE, FK auth.users(id) | Reference to auth user |
| `email` | VARCHAR(255) | NOT NULL | Email (copy from auth) |
| `nombre` | VARCHAR(255) | NOT NULL | User's full name |
| `rol` | VARCHAR(50) | DEFAULT 'OPERARIO', CHECK (ADMIN\|OPERARIO) | User role |
| `is_active` | BOOLEAN | DEFAULT true | Account active status |
| `ultimo_acceso` | TIMESTAMP | NULL | Last login time |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Record creation time |
| `updated_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Record update time |

**Indexes**:
- `idx_user_profiles_auth_id` on `auth_id` (primary lookup)
- `idx_user_profiles_email` on `email` (email search)
- `idx_user_profiles_rol` on `rol` (role filtering)
- `idx_user_profiles_created_at` on `created_at` (date filtering)

**RLS Policies** (Row Level Security):
- Users can view only their own profile
- Admins can view all profiles
- Users can update only their own profile
- Admins can update all profiles

---

## Relationships

```
auth.users (1) ──── (1) user_profiles
    |
    └─── id (auth_id)
```

When a user signs up in Supabase Auth:
1. Record created in `auth.users` with email and hashed password
2. Trigger `on_auth_user_created` fires automatically
3. New record created in `user_profiles` with profile data
4. User can now login and access the API

---

## Constraints

### Primary Key
- `user_profiles.id`: UUID, generated automatically
- `user_profiles.auth_id`: UNIQUE (one-to-one with auth.users)

### Foreign Key
- `user_profiles.auth_id` → `auth.users.id` (CASCADE DELETE)
  - If user deleted from auth, profile is automatically deleted

### Check Constraint
- `user_profiles.rol`: Must be 'ADMIN' or 'OPERARIO'

### Unique Constraint
- `user_profiles.auth_id`: Each user has exactly one profile
- `user_profiles.email`: Email is unique (no duplicate accounts)

---

## Triggers

### `on_auth_user_created`

**Event**: AFTER INSERT on `auth.users`  
**Function**: `handle_new_user()`  
**Action**: Auto-create profile in `user_profiles`

```sql
INSERT INTO user_profiles (
  auth_id, email, nombre, rol, is_active
) VALUES (
  new.id, new.email, new.email, 'OPERARIO', true
)
```

**Purpose**: Ensure every auth user has a corresponding profile.

---

## Future Tables (Planned)

### Clientes (Clients)
- Track client information
- Link to user_profiles (managed by)

### Municipios (Municipalities)
- Lookup table for municipalities
- Referenced by Clientes

### Deudas (Debts/Loans)
- Loan records
- Linked to Clientes
- Track principal, interest, status

### Abonos (Payments)
- Payment records
- Linked to Deudas
- Track payment amount, date, status

### Historial (History)
- Audit trail for all changes
- Track who changed what, when

---

## Data Integrity

### Enforced At Database Level
- ✓ Primary key uniqueness
- ✓ Foreign key constraints (CASCADE DELETE)
- ✓ Check constraints (rol IN ADMIN|OPERARIO)
- ✓ Unique constraints (auth_id, email)
- ✓ NOT NULL constraints

### Enforced At Application Level
- ✓ Email format validation (RFC 5322)
- ✓ Business logic validation (DJ ORM serializers)
- ✓ Authorization (user can only access own data)

---

## Backup & Recovery

**Backup**: Supabase automatically backs up all data daily.  
**Recovery**: Contact Supabase support for point-in-time recovery.

---

## Performance Considerations

1. **Indexing**: All frequently queried fields indexed
   - Lookups by auth_id (primary)
   - Searches by email
   - Filtering by rol
   - Date range queries (created_at)

2. **RLS**: Row-level security is enforced at DB level (efficient)

3. **Query Optimization**: Django ORM uses prepared statements

---

## Migrations

Currently, all schema is created via `init_supabase.sql`.

For future changes:
1. SQL script placed in `scripts/migrations/`
2. Version numbered: `001_initial_schema.sql`
3. Run manually in Supabase SQL Editor or via pipeline

---

## Disaster Recovery

**Scenario**: Accidental data deletion  
**Recovery Steps**:
1. Notify Supabase support
2. Request point-in-time recovery
3. Restore to backup timestamp

**Prevention**:
- Database backups enabled
- RLS prevents unauthorized access
- Audit trail (planned) tracks changes

---

**Last Updated**: 2026-04-29  
**Schema Version**: 1.0
