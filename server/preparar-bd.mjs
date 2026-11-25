// Prepara la BD antes de levantar la API (npm run api / npm start):
// crea la base y la tabla si no existen y, si la tabla está vacía, carga server/bd/inventario_vm.sql.
// Si la tabla ya tiene registros no toca nada, para no pisar el inventario.
//
// Crear la base pide permisos que el usuario de solo lectura no tiene: en ese caso pon en .env
// DB_ADMIN_USER y DB_ADMIN_PASSWORD (p. ej. root) y se usan solo para este paso.
import { readFileSync } from 'node:fs';
import mysql from 'mysql2/promise';
import { crearPool } from './bd.mjs';

const BASE = process.env.DB_NAME ?? 'inventario_vm';
const DUMP = new URL('./bd/inventario_vm.sql', import.meta.url);

const admin = process.env.DB_ADMIN_USER
  ? { user: process.env.DB_ADMIN_USER, password: process.env.DB_ADMIN_PASSWORD ?? '' }
  : {};

async function registros(pool) {
  try {
    const [[{ n }]] = await pool.query('SELECT COUNT(*) AS n FROM ??.producto', [BASE]);
    return n;
  } catch (err) {
    if (err.code === 'ER_NO_SUCH_TABLE' || err.code === 'ER_BAD_DB_ERROR') return 0;
    throw err;
  }
}

let pool;
try {
  pool = crearPool({ ...admin, database: undefined, connectionLimit: 1, multipleStatements: true });
  if ((await registros(pool)) > 0) {
    console.log(`[bd] ${BASE}.producto ya tiene registros`);
  } else {
    await pool.query('CREATE DATABASE IF NOT EXISTS ?? CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci', [BASE]);
    // Sin parámetros: un ? dentro del dump no debe tomarse como marcador
    await pool.query(`USE ${mysql.escapeId(BASE)};\n${readFileSync(DUMP, 'utf8')}`);
    console.log(`[bd] ${BASE}.producto creada con ${await registros(pool)} registros`);
  }
} catch (err) {
  // No detiene npm start: la API avisa por su cuenta si no puede leer la BD
  console.error(`[bd] No se pudo preparar ${BASE} (${err.code ?? err.message}). Revisa DB_* en .env`);
} finally {
  await pool?.end();
}
