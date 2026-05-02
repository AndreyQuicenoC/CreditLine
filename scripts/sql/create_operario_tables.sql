-- Create tables for operario pages

CREATE TABLE IF NOT EXISTS municipios (
  id TEXT PRIMARY KEY,
  nombre TEXT NOT NULL,
  activo BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS clientes (
  id TEXT PRIMARY KEY,
  nombre TEXT NOT NULL,
  cedula TEXT,
  sexo CHAR(1),
  telefono TEXT,
  telefono_alterno TEXT,
  municipio_id TEXT REFERENCES municipios(id) ON DELETE SET NULL,
  direccion_casa TEXT,
  direccion_trabajo TEXT,
  email TEXT,
  info_extra TEXT,
  fecha_registro DATE,
  activo BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS deudas (
  id TEXT PRIMARY KEY,
  cliente_id TEXT REFERENCES clientes(id) ON DELETE CASCADE,
  monto NUMERIC NOT NULL,
  interes_mensual NUMERIC NOT NULL,
  descripcion TEXT,
  fecha_inicio DATE,
  fecha_vencimiento DATE,
  estado TEXT NOT NULL DEFAULT 'activa'
);

CREATE TABLE IF NOT EXISTS abonos (
  id TEXT PRIMARY KEY,
  deuda_id TEXT REFERENCES deudas(id) ON DELETE CASCADE,
  monto NUMERIC NOT NULL,
  fecha DATE,
  notas TEXT,
  atrasado BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS deudas_personales (
  id TEXT PRIMARY KEY,
  concepto TEXT NOT NULL,
  acreedor TEXT,
  monto NUMERIC NOT NULL,
  interes_mensual NUMERIC NOT NULL,
  fecha_inicio DATE,
  fecha_vencimiento DATE,
  estado TEXT NOT NULL DEFAULT 'activa'
);

CREATE TABLE IF NOT EXISTS pagos_personales (
  id TEXT PRIMARY KEY,
  deuda_personal_id TEXT REFERENCES deudas_personales(id) ON DELETE CASCADE,
  monto NUMERIC NOT NULL,
  fecha DATE,
  notas TEXT,
  atrasado BOOLEAN NOT NULL DEFAULT FALSE
);

-- Indexes to help read queries
CREATE INDEX IF NOT EXISTS idx_clientes_municipio ON clientes(municipio_id);
CREATE INDEX IF NOT EXISTS idx_deudas_cliente ON deudas(cliente_id);
CREATE INDEX IF NOT EXISTS idx_abonos_deuda ON abonos(deuda_id);
CREATE INDEX IF NOT EXISTS idx_pagos_personales_deuda ON pagos_personales(deuda_personal_id);
