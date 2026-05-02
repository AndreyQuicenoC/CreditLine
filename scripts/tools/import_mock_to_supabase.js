/*
  Importer script that inserts frontend mock data into Supabase/Postgres.
  Usage:
    node import_mock_to_supabase.js

  Requirements:
    - Set environment variable `SUPABASE_URL` (not used directly here) and
      `SUPABASE_SERVICE_ROLE_KEY` or provide `DATABASE_URL` for direct psql.
    - This script uses `pg` to connect to the DB via `DATABASE_URL` env var.

  Notes:
    - It performs basic parameterized INSERTs to avoid SQL injection.
    - It will skip rows that conflict on primary key using ON CONFLICT DO NOTHING.
*/

const { Pool } = require('pg');
const path = require('path');
const mock = require(path.resolve(__dirname, './mockData.js'));

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('Please set DATABASE_URL to your Postgres connection string.');
  process.exit(1);
}

const pool = new Pool({ connectionString: DATABASE_URL });

async function run() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Municipios
    for (const m of mock.municipiosData) {
      await client.query(
        `INSERT INTO public.municipios(id,nombre,activo) VALUES($1,$2,$3) ON CONFLICT DO NOTHING`,
        [m.id, m.nombre, m.activo],
      );
    }

    // Clientes
    for (const c of mock.clientesData) {
      await client.query(
        `INSERT INTO public.clientes(id,nombre,cedula,sexo,telefono,telefono_alterno,municipio_id,direccion_casa,direccion_trabajo,email,info_extra,fecha_registro,activo) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) ON CONFLICT DO NOTHING`,
        [
          c.id,
          c.nombre,
          c.cedula,
          c.sexo,
          c.telefono,
          c.telefonoAlterno || null,
          c.municipioId || null,
          c.direccionCasa || null,
          c.direccionTrabajo || null,
          c.email || null,
          c.infoExtra || null,
          c.fechaRegistro || null,
          c.activo,
        ],
      );
    }

    // Deudas + Abonos (partial, deudas with abonos defined)
    for (const d of mock.deudasData) {
      await client.query(
        `INSERT INTO public.deudas(id,cliente_id,monto,interes_mensual,descripcion,fecha_inicio,fecha_vencimiento,estado) VALUES($1,$2,$3,$4,$5,$6,$7,$8) ON CONFLICT DO NOTHING`,
        [
          d.id,
          d.clienteId,
          d.monto,
          d.interesMensual,
          d.descripcion,
          d.fechaInicio,
          d.fechaVencimiento || null,
          d.estado,
        ],
      );

      for (const a of d.abonos || []) {
        await client.query(
          `INSERT INTO public.abonos(id,deuda_id,monto,fecha,notas,atrasado) VALUES($1,$2,$3,$4,$5,$6) ON CONFLICT DO NOTHING`,
          [a.id, a.deudaId, a.monto, a.fecha, a.notas || null, a.atrasado],
        );
      }
    }

    // Deudas personales and pagos
    for (const dp of mock.deudasPersonalesData) {
      await client.query(
        `INSERT INTO public.deudas_personales(id,concepto,acreedor,monto,interes_mensual,fecha_inicio,fecha_vencimiento,estado) VALUES($1,$2,$3,$4,$5,$6,$7,$8) ON CONFLICT DO NOTHING`,
        [
          dp.id,
          dp.concepto,
          dp.acreedor || null,
          dp.monto,
          dp.interesMensual || 0,
          dp.fechaInicio,
          dp.fechaVencimiento || null,
          dp.estado,
        ],
      );

      for (const p of dp.pagos || []) {
        await client.query(
          `INSERT INTO public.pagos_personales(id,deuda_personal_id,monto,fecha,notas,atrasado) VALUES($1,$2,$3,$4,$5,$6) ON CONFLICT DO NOTHING`,
          [p.id, p.deudaId, p.monto, p.fecha, p.notas || null, p.atrasado],
        );
      }
    }

    await client.query('COMMIT');
    console.log('Import completed successfully');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Import failed', err);
  } finally {
    client.release();
    await pool.end();
  }
}

run();
