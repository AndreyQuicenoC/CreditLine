# Changelog

All notable changes to this project will be documented in this file.

## 1.2.2 - UX Polish & Professional Confirmations

- Frontend: Replace browser alert() confirmations with professional DeleteConfirmModal overlays
  - FinanzasPersonales: Debt and payment deletion with smooth animations
  - ClienteDetalle: Client debt deletion with professional overlay
- UX: Fix focus loss on keystroke in edit modals
  - NuevaDeudaModal: autoFocus only when creating (not editing existing debts)
  - RegistrarPagoModal: autoFocus only when creating payments (not editing existing payments)
- Components: Add DeleteConfirmModal with ARIA accessibility attributes, loading states, and design system consistency
- Testing: Verify build passes with TypeScript strict mode, all pages load correctly with real data
- Build: Successfully compile frontend (2932 modules, 1.4MB gzipped) and pass backend system checks

## 1.2.1 - Operario Backend Implementation

- Backend: Complete operario app with models, serializers, views, and services for full loan management
- Models: Municipio, Cliente, Deuda, Abono, DeudaPersonal, PagoPersonal with proper relationships and indexes
- API: 12 comprehensive REST endpoints for municipios, clientes, deudas, estadísticas, and finanzas personales
- Services: Business logic layer with EstadisticasService, ClienteService, DeudaService, FinanzasPersonalesService
- Security: JWT authentication, CORS configuration, input validation, parameterized queries, error handling
- Pagination: Efficient data transfer with 10-item default pagination (configurable)
- Serializers: Custom serializers with calculated fields (saldo_pendiente, interes_acumulado, tasa_cumplimiento)
- Admin: Django admin interface for all operario models
- Documentation: OPERARIO_API.md, OPERARIO_SECURITY_CHECKLIST.md, OPERARIO_IMPLEMENTATION.md
- Scripts: init_operario.py for database initialization and verification
- Version: Bump to 1.2.1

## 1.2.0 - Operario Section

- Frontend: Add and align operator (operario) views and routes (Inicio, Cartera, Municipios, Deudas, Estadísticas, Finanzas).
- Data: Add database schema and initial seeding scripts for operator-related tables (municipios, clientes, deudas, abonos, finanzas).
- Docs: Add database documentation for operario views and seed instructions.
- Misc: Bump version to 1.2.0 and add technology badges to README.

## 1.1.1 - Patch

- Fix: Create user endpoint updated to be compatible with dev `mock_auth_users` schema (avoids "column auth_id does not exist").
- UX: Enter-to-submit on create/edit overlays, password visibility toggle, and keep overlay open on create errors when email already exists.
- Notifications: add close action to toolkit toasts.

## 1.1.0 - Admin Section

- Added the first dedicated administrator section.
- Strengthened the admin-focused user flow and project documentation.
- Verified backend and frontend deployment checks after the release update.

## 1.0.0 - Base Version

- Initial platform foundation.
- Authentication, routing, and core loan management scaffolding.
