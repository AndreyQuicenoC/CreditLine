# Changelog

All notable changes to this project will be documented in this file.

## 1.1.0 - Admin Section

- Added the first dedicated administrator section.
- Strengthened the admin-focused user flow and project documentation.
- Verified backend and frontend deployment checks after the release update.

## 1.1.1 - Patch

- Fix: Create user endpoint updated to be compatible with dev `mock_auth_users` schema (avoids "column auth_id does not exist").
- UX: Enter-to-submit on create/edit overlays, password visibility toggle, and keep overlay open on create errors when email already exists.
- Notifications: add close action to toolkit toasts.

## 1.2.0 - Operario Section

- Frontend: Add and align operator (operario) views and routes (Inicio, Cartera, Municipios, Deudas, Estadísticas, Finanzas).
- Data: Add database schema and initial seeding scripts for operator-related tables (municipios, clientes, deudas, abonos, finanzas).
- Docs: Add database documentation for operario views and seed instructions.
- Misc: Bump version to 1.2.0 and add technology badges to README.

## 1.0.0 - Base Version

- Initial platform foundation.
- Authentication, routing, and core loan management scaffolding.
