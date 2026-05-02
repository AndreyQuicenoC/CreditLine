-- Seed a representative subset of mock data (municipios, clientes, deudas, abonos, deudas personales, pagos personales)

-- Municipios
INSERT INTO municipios (id, nombre, activo) VALUES
('m1', 'Medellín', true),
('m2', 'Envigado', true),
('m3', 'Itagüí', true),
('m4', 'Sabaneta', true),
('m5', 'Bello', true)
ON CONFLICT (id) DO NOTHING;

-- Clientes (first 5)
INSERT INTO clientes (id, nombre, cedula, sexo, telefono, telefono_alterno, municipio_id, direccion_casa, direccion_trabajo, email, info_extra, fecha_registro, activo) VALUES
('c1','María González','1234567890','F','312 456 7890','604 123 4567','m1','Calle 50 #45-32, Laureles','Carrera 70 #44-10, Oficina 302','maria.gonzalez@email.com','Cliente confiable. Familiares: Esposo Juan González. Trabaja en empresa de contabilidad.','2025-03-15',true),
('c2','Carlos Ramírez','0987654321','M','311 234 5678',NULL,'m2','Cra 43A #9Sur-100, Envigado','Centro Comercial El Tesoro Local 124','carlos.ramirez@email.com','Comerciante. Paga puntuales. Tiene local de ropa.','2025-04-10',true),
('c3','Ana Martínez','1122334455','F','300 987 6543','312 789 0123','m4','Calle 75 Sur #33-20, Sabaneta',NULL,'ana.martinez@email.com','Historial irregular. Hermana: Claudia Martínez.','2025-05-20',true),
('c4','Luis Fernández','5544332211','M','314 567 8901',NULL,'m1','Carrera 80 #30-15, Estadio',NULL,'luis.fernandez@email.com','Tendencia a atrasos. Avisar con 5 días de anticipación.','2025-06-01',true),
('c5','Patricia López','6677889900','F','313 890 1234',NULL,'m3','Calle 33 #52-18, Itagüí','Zona Industrial Itagüí, Bodega 7','patricia.lopez@email.com','Empresaria textil. Prefiere pagos al inicio del mes.','2025-06-15',true)
ON CONFLICT (id) DO NOTHING;

-- Deudas (first 5) and abonos
INSERT INTO deudas (id, cliente_id, monto, interes_mensual, descripcion, fecha_inicio, fecha_vencimiento, estado) VALUES
('d1','c1',500000,10,'Gastos médicos urgentes','2026-01-05','2026-07-05','activa'),
('d2','c1',300000,8,'Compra de electrodomésticos','2025-09-01','2025-12-01','pagada'),
('d3','c2',800000,12,'Capital para inventario de tienda','2026-02-10','2026-08-10','activa'),
('d4','c3',600000,15,'Remodelación del hogar','2025-11-01','2026-05-01','activa'),
('d5','c3',400000,10,'Pago de servicios acumulados','2026-03-20',NULL,'activa')
ON CONFLICT (id) DO NOTHING;

INSERT INTO abonos (id, deuda_id, monto, fecha, notas, atrasado) VALUES
('a1','d1',100000,'2026-02-05','Abono quincenal',false),
('a2','d1',100000,'2026-03-05','Pago puntual',false),
('a3','d1',80000,'2026-04-10','Abono parcial',false),
('a4','d2',100000,'2025-10-01','Abono 1',false),
('a5','d2',100000,'2025-11-01','Abono 2',false),
('a6','d2',124000,'2025-12-01','Saldo + intereses',false),
('a7','d3',150000,'2026-03-10','Primer abono',false),
('a8','d3',150000,'2026-04-10','Segundo abono',false),
('a9','d4',80000,'2025-12-15','Primer abono',true),
('a10','d4',80000,'2026-02-10','Atrasado 40 días',true),
('a11','d5',50000,'2026-04-25','',true)
ON CONFLICT (id) DO NOTHING;

-- Deudas personales y pagos (representative)
INSERT INTO deudas_personales (id, concepto, acreedor, monto, interes_mensual, fecha_inicio, fecha_vencimiento, estado) VALUES
('dp1','Tarjeta de Crédito Bancolombia','Bancolombia',3500000,2,'2025-06-01','2026-06-01','activa'),
('dp2','Préstamo Vehículo','Banco Davivienda',15000000,1.5,'2024-01-01','2027-12-30','activa')
ON CONFLICT (id) DO NOTHING;

INSERT INTO pagos_personales (id, deuda_personal_id, monto, fecha, notas, atrasado) VALUES
('pp1','dp1',350000,'2025-07-01','',false),
('pp2','dp1',350000,'2025-08-01','',false),
('pp6','dp1',200000,'2026-01-15','Pago tardío enero',true),
('pp7','dp2',500000,'2024-02-01','',false)
ON CONFLICT (id) DO NOTHING;
