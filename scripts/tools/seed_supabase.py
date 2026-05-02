#!/usr/bin/env python3
"""
Seed Supabase/Postgres with the full frontend mock data.
Reads DB connection from backend/.env (DATABASE_HOST, DATABASE_PORT, DATABASE_NAME, DATABASE_USER, DATABASE_PASSWORD).

Usage: python scripts/tools/seed_supabase.py
"""
import json
import subprocess
import sys
from pathlib import Path

import psycopg2


ROOT = Path(__file__).resolve().parents[2]
ENV_PATH = ROOT / 'backend' / '.env'
TS_MOCK_PATH = ROOT / 'frontend' / 'src' / 'app' / 'data' / 'mockData.ts'


if not ENV_PATH.exists():
    print(f"Could not find .env at {ENV_PATH}")
    sys.exit(1)


def parse_env(path: Path):
    data = {}
    with path.open('r', encoding='utf-8') as handle:
        for line in handle:
            line = line.strip()
            if not line or line.startswith('#') or '=' not in line:
                continue
            key, value = line.split('=', 1)
            data[key.strip()] = value.strip()
    return data


def load_full_mock_data(ts_path: Path):
    js_code = r'''
const fs = require('fs');
const vm = require('vm');

function extractArraySource(source, exportName) {
  const token = `export const ${exportName}`;
  const startIndex = source.indexOf(token);
  if (startIndex === -1) throw new Error(`Missing export: ${exportName}`);

  const arrayStart = source.indexOf('[', startIndex);
  if (arrayStart === -1) throw new Error(`Missing array start for: ${exportName}`);

  let depth = 0;
  let inString = false;
  let quote = '';
  let escaped = false;
  let inLineComment = false;
  let inBlockComment = false;

  for (let i = arrayStart; i < source.length; i += 1) {
    const char = source[i];
    const next = source[i + 1];

    if (inLineComment) {
      if (char === '\n') inLineComment = false;
      continue;
    }

    if (inBlockComment) {
      if (char === '*' && next === '/') {
        inBlockComment = false;
        i += 1;
      }
      continue;
    }

    if (inString) {
      if (escaped) {
        escaped = false;
        continue;
      }
      if (char === '\\') {
        escaped = true;
        continue;
      }
      if (char === quote) {
        inString = false;
      }
      continue;
    }

    if (char === '/' && next === '/') {
      inLineComment = true;
      i += 1;
      continue;
    }

    if (char === '/' && next === '*') {
      inBlockComment = true;
      i += 1;
      continue;
    }

    if (char === '"' || char === "'" || char === '`') {
      inString = true;
      quote = char;
      continue;
    }

    if (char === '[') depth += 1;
    if (char === ']') {
      depth -= 1;
      if (depth === 0) return source.slice(arrayStart, i + 1);
    }
  }

  throw new Error(`Unterminated array for: ${exportName}`);
}

const tsPath = process.argv[1];
const source = fs.readFileSync(tsPath, 'utf8');
const exportsToLoad = ['municipiosData', 'clientesData', 'deudasData', 'deudasPersonalesData'];
const data = {};

for (const exportName of exportsToLoad) {
  const arraySource = extractArraySource(source, exportName);
  data[exportName] = vm.runInNewContext(`(${arraySource})`, {}, { timeout: 2000 });
}

process.stdout.write(JSON.stringify(data));
'''

    result = subprocess.run(
        ['node', '-e', js_code, str(ts_path)],
        capture_output=True,
        text=True,
        check=True,
    )
    return json.loads(result.stdout)


def main():
    env = parse_env(ENV_PATH)
    db_host = env.get('DATABASE_HOST')
    db_port = env.get('DATABASE_PORT') or '5432'
    db_name = env.get('DATABASE_NAME') or env.get('DATABASE_URL', '').rsplit('/', 1)[-1]
    db_user = env.get('DATABASE_USER')
    db_pass = env.get('DATABASE_PASSWORD')

    print('Using DB connection:')
    print(' host=', db_host)
    print(' port=', db_port)
    print(' db=', db_name)
    print(' user=', db_user)

    if not all([db_host, db_port, db_name, db_user, db_pass]):
        print('Missing DB connection parameters in backend/.env. Aborting.')
        sys.exit(1)

    if not TS_MOCK_PATH.exists():
        print(f'Could not find mock data at {TS_MOCK_PATH}')
        sys.exit(1)

    create_sql = (ROOT / 'scripts' / 'sql' / 'create_operario_tables.sql').read_text(encoding='utf-8')
    mock = load_full_mock_data(TS_MOCK_PATH)

    conn = None
    try:
        conn = psycopg2.connect(
            host=db_host,
            port=db_port,
            dbname=db_name,
            user=db_user,
            password=db_pass,
        )
        conn.autocommit = False
        cur = conn.cursor()

        print('Executing create tables SQL...')
        cur.execute(create_sql)
        print('Create tables executed.')

        print('Seeding municipios...')
        for municipio in mock['municipiosData']:
            cur.execute(
                'INSERT INTO public.municipios(id,nombre,activo) VALUES(%s,%s,%s) ON CONFLICT (id) DO NOTHING',
                (municipio['id'], municipio['nombre'], municipio['activo']),
            )

        print('Seeding clientes...')
        for cliente in mock['clientesData']:
            cur.execute(
                '''
                INSERT INTO public.clientes(
                  id, nombre, cedula, sexo, telefono, telefono_alterno,
                  municipio_id, direccion_casa, direccion_trabajo, email,
                  info_extra, fecha_registro, activo
                ) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
                ON CONFLICT (id) DO NOTHING
                ''',
                (
                    cliente['id'],
                    cliente['nombre'],
                    cliente['cedula'],
                    cliente['sexo'],
                    cliente['telefono'],
                    cliente.get('telefonoAlterno'),
                    cliente.get('municipioId'),
                    cliente.get('direccionCasa'),
                    cliente.get('direccionTrabajo'),
                    cliente.get('email'),
                    cliente.get('infoExtra'),
                    cliente.get('fechaRegistro'),
                    cliente['activo'],
                ),
            )

        print('Seeding deudas and abonos...')
        for deuda in mock['deudasData']:
            cur.execute(
                '''
                INSERT INTO public.deudas(
                  id, cliente_id, monto, interes_mensual, descripcion,
                  fecha_inicio, fecha_vencimiento, estado
                ) VALUES (%s,%s,%s,%s,%s,%s,%s,%s)
                ON CONFLICT (id) DO NOTHING
                ''',
                (
                    deuda['id'],
                    deuda['clienteId'],
                    deuda['monto'],
                    deuda['interesMensual'],
                    deuda['descripcion'],
                    deuda.get('fechaInicio'),
                    deuda.get('fechaVencimiento'),
                    deuda['estado'],
                ),
            )

            for abono in deuda.get('abonos', []):
                cur.execute(
                    '''
                    INSERT INTO public.abonos(id,deuda_id,monto,fecha,notas,atrasado)
                    VALUES (%s,%s,%s,%s,%s,%s)
                    ON CONFLICT (id) DO NOTHING
                    ''',
                    (
                        abono['id'],
                        abono['deudaId'],
                        abono['monto'],
                        abono['fecha'],
                        abono.get('notas'),
                        abono['atrasado'],
                    ),
                )

        print('Seeding deudas personales and pagos personales...')
        for deuda_personal in mock['deudasPersonalesData']:
            cur.execute(
                '''
                INSERT INTO public.deudas_personales(
                  id, concepto, acreedor, monto, interes_mensual,
                  fecha_inicio, fecha_vencimiento, estado
                ) VALUES (%s,%s,%s,%s,%s,%s,%s,%s)
                ON CONFLICT (id) DO NOTHING
                ''',
                (
                    deuda_personal['id'],
                    deuda_personal['concepto'],
                    deuda_personal.get('acreedor'),
                    deuda_personal['monto'],
                    deuda_personal['interesMensual'],
                    deuda_personal.get('fechaInicio'),
                    deuda_personal.get('fechaVencimiento'),
                    deuda_personal['estado'],
                ),
            )

            for pago in deuda_personal.get('pagos', []):
                cur.execute(
                    '''
                    INSERT INTO public.pagos_personales(id,deuda_personal_id,monto,fecha,notas,atrasado)
                    VALUES (%s,%s,%s,%s,%s,%s)
                    ON CONFLICT (id) DO NOTHING
                    ''',
                    (
                        pago['id'],
                        pago['deudaId'],
                        pago['monto'],
                        pago['fecha'],
                        pago.get('notas'),
                        pago['atrasado'],
                    ),
                )

        conn.commit()
        cur.close()
        print('Seed executed.')
    except Exception as exc:
        if conn:
            conn.rollback()
        print('Error during DB operations:', exc)
        sys.exit(1)
    finally:
        if conn:
            conn.close()

    print('Done.')


if __name__ == '__main__':
    main()
