// API de solo lectura sobre inventario_vm.producto.
// En producción también sirve el build de Angular (dist/verdemagenta/browser).
import express from 'express';
import mysql from 'mysql2/promise';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { aProducto, GROSORES } from './catalogo.mjs';
import { FAMILIAS } from './colores.mjs';

const PUERTO = Number(process.env.PORT ?? 3000);
const CACHE_MS = Number(process.env.CACHE_MS ?? 60_000);

const pool = mysql.createPool({
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 3306),
  user: process.env.DB_USER ?? 'root',
  password: process.env.DB_PASSWORD ?? '',
  database: process.env.DB_NAME ?? 'inventario_vm',
  connectionLimit: 5,
  charset: 'utf8mb4',
});

let cache = { cuando: 0, productos: null };

const raiz = path.dirname(fileURLToPath(import.meta.url));

// Ids con foto, generados por `npm run fotos`
function fotos() {
  try {
    return new Set(JSON.parse(readFileSync(path.resolve(raiz, '../public/fotos/fotos.json'), 'utf8')));
  } catch {
    return new Set();
  }
}

async function productos() {
  if (cache.productos && Date.now() - cache.cuando < CACHE_MS) return cache.productos;
  const [filas] = await pool.query(
    'SELECT id, producto, precio, descripcion, categoria FROM producto ORDER BY id',
  );
  const conFoto = fotos();
  cache = { cuando: Date.now(), productos: filas.map((f) => aProducto(f, conFoto)) };
  return cache.productos;
}

const app = express();
app.disable('x-powered-by');

app.get('/api/catalogo', async (_req, res) => {
  try {
    res.json({ productos: await productos(), grosores: GROSORES, familias: FAMILIAS });
  } catch (err) {
    console.error('[api] no se pudo leer inventario_vm:', err.message);
    res.status(503).json({ error: 'El catálogo no está disponible en este momento.' });
  }
});

app.get('/api/productos/:id', async (req, res) => {
  try {
    const producto = (await productos()).find((p) => p.id === Number(req.params.id));
    if (!producto) return res.status(404).json({ error: 'Producto no encontrado.' });
    res.json(producto);
  } catch (err) {
    console.error('[api] no se pudo leer inventario_vm:', err.message);
    res.status(503).json({ error: 'El catálogo no está disponible en este momento.' });
  }
});

const sitio = path.resolve(raiz, '../dist/verdemagenta/browser');
if (existsSync(sitio)) {
  app.use(express.static(sitio, { index: false, maxAge: '7d' }));
  app.get(/^\/(?!api\/).*/, (_req, res) => res.sendFile(path.join(sitio, 'index.html')));
}

app.listen(PUERTO, async () => {
  console.log(`[api] Verdemagenta escuchando en http://localhost:${PUERTO}`);
  try {
    const [[{ n }]] = await pool.query('SELECT COUNT(*) AS n FROM producto');
    console.log(`[api] inventario_vm conectada: ${n} productos`);
  } catch (err) {
    console.error(`[api] No se pudo conectar a MySQL (${err.code ?? err.message}). Revisa DB_* en .env`);
  }
});
