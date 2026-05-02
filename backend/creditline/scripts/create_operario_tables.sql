-- create_operario_tables.sql
-- Schema and seed data for operario views: municipios, clientes, deudas, abonos, finanzas
-- Idempotent: uses IF NOT EXISTS and ON CONFLICT DO NOTHING for seeds

BEGIN;

-- Municipios
CREATE TABLE IF NOT EXISTS public.municipios (
  id VARCHAR PRIMARY KEY,
  nombre VARCHAR NOT NULL,
  activo BOOLEAN NOT NULL DEFAULT true
);

-- Clientes
CREATE TABLE IF NOT EXISTS public.clientes (
  id VARCHAR PRIMARY KEY,
  nombre VARCHAR NOT NULL,
  cedula VARCHAR UNIQUE NOT NULL,
  sexo VARCHAR(1) NOT NULL,
  telefono VARCHAR NOT NULL,
  telefono_alterno VARCHAR NULL,
  municipio_id VARCHAR REFERENCES public.municipios(id) ON DELETE SET NULL,
  direccion_casa TEXT,
  direccion_trabajo TEXT,
  email VARCHAR NULL,
  info_extra TEXT NULL,
  fecha_registro DATE NOT NULL,
  activo BOOLEAN NOT NULL DEFAULT true
);

-- Deudas (loan records)
CREATE TABLE IF NOT EXISTS public.deudas (
  id VARCHAR PRIMARY KEY,
  cliente_id VARCHAR REFERENCES public.clientes(id) ON DELETE CASCADE,
  monto NUMERIC NOT NULL,
  interes_mensual NUMERIC NOT NULL DEFAULT 0,
  descripcion TEXT,
  fecha_inicio DATE NOT NULL,
  fecha_vencimiento DATE NULL,
  estado VARCHAR(20) NOT NULL DEFAULT 'activa' CHECK (estado IN ('activa','pagada'))
);

-- Abonos (payments for deudas)
CREATE TABLE IF NOT EXISTS public.abonos (
  id VARCHAR PRIMARY KEY,
  deuda_id VARCHAR REFERENCES public.deudas(id) ON DELETE CASCADE,
  monto NUMERIC NOT NULL,
  fecha DATE NOT NULL,
  notas TEXT NULL,
  atrasado BOOLEAN NOT NULL DEFAULT false
);

-- Finanzas personales (separate personal debts table)
CREATE TABLE IF NOT EXISTS public.deudas_personales (
  id VARCHAR PRIMARY KEY,
  concepto VARCHAR NOT NULL,
  acreedor VARCHAR,
  monto NUMERIC NOT NULL,
  interes_mensual NUMERIC DEFAULT 0,
  fecha_inicio DATE NOT NULL,
  fecha_vencimiento DATE NULL,
  estado VARCHAR(20) NOT NULL DEFAULT 'activa' CHECK (estado IN ('activa','pagada'))
);

CREATE TABLE IF NOT EXISTS public.pagos_personales (
  id VARCHAR PRIMARY KEY,
  deuda_personal_id VARCHAR REFERENCES public.deudas_personales(id) ON DELETE CASCADE,
  monto NUMERIC NOT NULL,
  fecha DATE NOT NULL,
  notas TEXT NULL,
  atrasado BOOLEAN NOT NULL DEFAULT false
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_clientes_municipio ON public.clientes(municipio_id);
CREATE INDEX IF NOT EXISTS idx_deudas_cliente ON public.deudas(cliente_id);
CREATE INDEX IF NOT EXISTS idx_abonos_deuda ON public.abonos(deuda_id);

-- SEED: Municipios
INSERT INTO public.municipios (id, nombre, activo) VALUES
  ('m1','Medellín', true),
  ('m2','Envigado', true),
  ('m3','Itagüí', true),
  ('m4','Sabaneta', true),
  ('m5','Bello', true),
  ('m6','Rionegro', true),
  ('m7','La Estrella', false)
ON CONFLICT DO NOTHING;

-- SEED: Clientes (sample set matching frontend mock data)
INSERT INTO public.clientes (id, nombre, cedula, sexo, telefono, telefono_alterno, municipio_id, direccion_casa, direccion_trabajo, email, info_extra, fecha_registro, activo) VALUES
  ('c1','María González','1234567890','F','312 456 7890','604 123 4567','m1','Calle 50 #45-32, Laureles','Carrera 70 #44-10, Oficina 302','maria.gonzalez@email.com','Cliente confiable. Familiares: Esposo Juan González. Trabaja en empresa de contabilidad.','2025-03-15', true),
  ('c2','Carlos Ramírez','0987654321','M','311 234 5678',NULL,'m2','Cra 43A #9Sur-100, Envigado','Centro Comercial El Tesoro Local 124','carlos.ramirez@email.com','Comerciante. Paga puntuales. Tiene local de ropa.','2025-04-10', true),
  ('c3','Ana Martínez','1122334455','F','300 987 6543','312 789 0123','m4','Calle 75 Sur #33-20, Sabaneta',NULL,'ana.martinez@email.com','Historial irregular. Hermana: Claudia Martínez (312 000 1111). Precaución con montos altos.','2025-05-20', true),
  ('c4','Luis Fernández','5544332211','M','314 567 8901',NULL,'m1','Carrera 80 #30-15, Estadio',NULL,'luis.fernandez@email.com','Tendencia a atrasos. Avisar con 5 días de anticipación.','2025-06-01', true),
  ('c5','Patricia López','6677889900','F','313 890 1234',NULL,'m3','Calle 33 #52-18, Itagüí','Zona Industrial Itagüí, Bodega 7','patricia.lopez@email.com','Empresaria textil. Prefiere pagos al inicio del mes.','2025-06-15', true),
  ('c6','Jorge Salazar','7788990011','M','315 123 4567',NULL,'m5','Cra 56 #210-30, Bello',NULL,'jorge.salazar@email.com','Conductor de transporte. Trabaja por turnos.','2025-07-08', true),
  ('c7','Claudia Torres','8899001122','F','316 234 5678',NULL,'m2','Calle 17 Sur #37A-52, Envigado',NULL,'claudia.torres@email.com','Docente universitaria. Muy cumplida.','2025-07-25', true),
  ('c8','Ricardo Herrera','9900112233','M','317 345 6789',NULL,'m6','Cl 50 #24-15, Rionegro',NULL,'ricardo.herrera@email.com','Agricultor. Pagos irregulares por temporadas.','2025-08-12', true),
  ('c9','Sandra Vargas','1023456789','F','318 456 7890',NULL,'m1','Cra 65 #48-20, Laureles',NULL,'sandra.vargas@email.com','Estilista. Atiende en su casa.','2025-08-30', true),
  ('c10','Andrés Mejía','1112223334','M','319 567 8901','310 111 2222','m4','Calle 78B Sur #42-10, Sabaneta',NULL,'andres.mejia@email.com','Ingeniero de sistemas freelance. Muy responsable.','2025-09-15', true),
  ('c11','Natalia Ríos','2223334445','F','320 678 9012',NULL,'m3','Cra 44 #50A-30, Itagüí',NULL,'natalia.rios@email.com','Vendedora independiente. A veces requiere flexibilidad.','2025-10-05', true),
  ('c12','Felipe Castillo','3334445556','M','321 789 0123',NULL,'m1','Cl 10A #32-50, El Poblado',NULL,'felipe.castillo@email.com','Abogado. Muy formal y puntual.','2025-10-20', true),
  ('c13','Diana Ospina','4445556667','F','322 890 1234',NULL,'m5','Cra 48 #190-20, Bello',NULL,'diana.ospina@email.com','Ama de casa. Marido trabaja en construcción.','2025-11-10', true),
  ('c14','Sebastián Cano','5556667778','M','323 901 2345',NULL,'m6','Cl 30 #11-55, Rionegro',NULL,'sebastian.cano@email.com','Veterinario. Clínica propia.','2025-11-28', true),
  ('c15','Laura Zuluaga','6667778889','F','324 012 3456',NULL,'m2','Cra 40 #12Sur-80, Envigado',NULL,'laura.zuluaga@email.com','Contadora. Prefiere pagos los viernes.','2025-12-05', true)
ON CONFLICT DO NOTHING;

-- SEED: Example deudas and abonos for key clients (partial seed to demonstrate structure)
INSERT INTO public.deudas (id, cliente_id, monto, interes_mensual, descripcion, fecha_inicio, fecha_vencimiento, estado) VALUES
  ('d1','c1',500000,10,'Gastos médicos urgentes','2026-01-05','2026-07-05','activa'),
  ('d2','c1',300000,8,'Compra de electrodomésticos','2025-09-01','2025-12-01','pagada'),
  ('d3','c2',800000,12,'Capital para inventario de tienda','2026-02-10','2026-08-10','activa'),
  ('d4','c3',600000,15,'Remodelación del hogar','2025-11-01','2026-05-01','activa')
ON CONFLICT DO NOTHING;

INSERT INTO public.abonos (id, deuda_id, monto, fecha, notas, atrasado) VALUES
  ('a1','d1',100000,'2026-02-05','Abono quincenal', false),
  ('a2','d1',100000,'2026-03-05','Pago puntual', false),
  ('a3','d1',80000,'2026-04-10','Abono parcial', false),
  ('a4','d2',100000,'2025-10-01','Abono 1', false),
  ('a5','d2',100000,'2025-11-01','Abono 2', false),
  ('a6','d2',124000,'2025-12-01','Saldo + intereses', false),
  ('a7','d3',150000,'2026-03-10','Primer abono', false),
  ('a8','d3',150000,'2026-04-10','Segundo abono', false),
  ('a9','d4',80000,'2025-12-15','Primer abono', true),
  ('a10','d4',80000,'2026-02-10','Atrasado 40 días', true)
ON CONFLICT DO NOTHING;

-- Commit
COMMIT;

-- Notes: This script creates stable tables that reflect the frontend mock data structure.
-- For full seeding (every mock entry from frontend/src/app/data/mockData.ts), run a dedicated importer that reads the JSON/TS mock file and inserts records using the same patterns used here.
