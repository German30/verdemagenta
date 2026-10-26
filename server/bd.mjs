// Conexión a MySQL siempre cifrada con TLS (1.2 o más).
//
// - DB_SSL_CA=ruta/al/ca.pem: verifica el certificado del servidor MySQL (obligatorio si la BD
//   no está en esta misma máquina). En MySQL 8 el CA autogenerado es <datadir>/ca.pem.
// - Sin DB_SSL_CA y con la BD en localhost: el tráfico va cifrado igual, pero el certificado
//   autofirmado de MySQL no se puede verificar.
import mysql from 'mysql2/promise';
import { readFileSync } from 'node:fs';

const LOCALES = new Set(['localhost', '127.0.0.1', '::1']);

function ssl(host) {
  const ca = process.env.DB_SSL_CA;
  if (ca) {
    let pem;
    try {
      pem = readFileSync(ca);
    } catch (err) {
      throw new Error(`No se pudo leer DB_SSL_CA (${ca}): ${err.message}`);
    }
    return { ca: pem, rejectUnauthorized: true, minVersion: 'TLSv1.2' };
  }
  if (LOCALES.has(host)) {
    console.warn('[bd] TLS sin verificar el certificado de MySQL; define DB_SSL_CA para verificarlo');
    return { rejectUnauthorized: false, minVersion: 'TLSv1.2' };
  }
  throw new Error(`La BD está en ${host}: define DB_SSL_CA para verificar su certificado TLS`);
}

export function crearPool(opciones = {}) {
  const host = process.env.DB_HOST ?? 'localhost';
  return mysql.createPool({
    host,
    port: Number(process.env.DB_PORT ?? 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD ?? '',
    database: process.env.DB_NAME ?? 'inventario_vm',
    charset: 'utf8mb4',
    ssl: ssl(host),
    ...opciones,
  });
}
