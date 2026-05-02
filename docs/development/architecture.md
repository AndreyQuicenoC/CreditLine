# Architecture Overview

This project is a two-tier web application with separate backend and frontend codebases.

- Backend: Django 4.2 (REST API + authentication). Responsible for business logic, persistence, and admin endpoints.
- Database: PostgreSQL (Supabase in production). Uses triggers and RLS for some automation and security.
- Frontend: React + TypeScript + Vite. Provides the user interface, communicates with backend via JWT-bearing requests.
- Auth flow: custom JWT (HS256) with token payload containing `sub` set to the `auth_id` (UUID) used to link `user_profiles`.

Integration points:
- Backend maps auth tokens (`sub`) to application users via `mock_auth_users` (dev) or Supabase auth (production).
- Triggers create `user_profiles` on auth user creation.
