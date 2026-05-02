# Operario Database Schema and Seed

This document describes the schema required to support the operario (operator) views and includes instructions to seed example data used by the frontend mock.

Location of schema script:

- `backend/creditline/scripts/create_operario_tables.sql`

Overview of tables:

- `municipios` — Simple lookup table for municipality names and active flag.
- `clientes` — Client profiles used in the operator portfolio (cartera).
- `deudas` — Loans associated to `clientes`.
- `abonos` — Payments applied to `deudas`.
- `deudas_personales` / `pagos_personales` — Personal finance tracking (frontend uses `Finanzas`).

Design notes and constraints:

- Primary keys are string IDs to match frontend mock IDs (e.g., `c1`, `d1`, `a1`). This avoids mismatch with generated UUIDs and keeps seed imports deterministic.
- Foreign keys are declared with `ON DELETE CASCADE` for payments when their parent debt is removed, and `ON DELETE SET NULL` for cliente->municipio links.
- Indexes are created to optimize common queries used by the operator views (lookups by municipio, cliente, and deuda).

Seeding strategy:

1. The included SQL script seeds the main `municipios` and `clientes` rows and provides example `deudas` and `abonos` for key records.
2. For a complete replication of the frontend mock (`frontend/src/app/data/mockData.ts`), use a small Node/Python importer that parses that file (or a JSON export) and inserts records using the same keys.

Security & Best Practices:

- Use prepared statements or parameterized queries when migrating data from external sources to prevent SQL injection.
- In Supabase, enable Row Level Security (RLS) and create policies that match application roles (admins vs operarios).
- Do not expose service role keys to the frontend. Use server-side endpoints when needing elevated privileges.

How to apply to Supabase (manual steps):

1. Open your Supabase project.
2. Go to SQL Editor and paste the contents of `create_operario_tables.sql`.
3. Run the script. It is idempotent and safe to re-run.

Optional: Automatic deployment

- Use Supabase CLI or API to run the SQL remotely as part of your deployment pipeline. Ensure the service role key is stored securely in CI secrets.

Reference: frontend mock data: `frontend/src/app/data/mockData.ts` — use this file to generate a complete seed importer when full parity is required.
