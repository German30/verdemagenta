// API de solo lectura sobre inventario_vm.producto.
// En producción también sirve el build de Angular (dist/verdemagenta/browser).
import express from 'express';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import mysql from 'mysql2/promise';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { aProducto, GROSORES } from './catalogo.mjs';
import { FAMILIAS } from './colores.mjs';

const PUERTO = Number(process.env.PORT ?? 3000);
const CACHE_MS = Number(process.env.CACHE_MS ?? 60_000);
const PRODUCCION = process.env.NODE_ENV === 'production' || process.argv.includes('--produccion');
// HTTPS lo pone el proxy de publicación; sin TRUST_PROXY se asume HTTP local
const HTTPS = PRODUCCION && !!process.env.TRUST_PROXY;

// Sin valor por defecto: la API usa un usuario de solo lectura (ver server/usuario-lectura.sql), nunca root
if (!process.env.DB_USER) {
  console.error('[api] Falta DB_USER en .env');
  process.exit(1);
}
if (process.env.DB_USER === 'root') {
  console.warn('[api] Aviso: la API se conecta como root; usa el usuario de solo lectura de server/usuario-lectura.sql');
}

const pool = mysql.createPool({
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD ?? '',
  database: process.env.DB_NAME ?? 'inventario_vm',
  connectionLimit: 5,
  charset: 'utf8mb4',
});

let cache = { cuando: 0, productos: null };

const raiz = path.dirname(fileURLToPath(import.meta.url));

// Datos sacados de las fotos: fotos.json (ids con foto, `npm run fotos`), colores.json y
// lomos.json (color real y recorte para la carta, `npm run colores-fotos`)
function deFotos(archivo, vacio) {
  try {
    return JSON.parse(readFileSync(path.resolve(raiz, '../public/fotos', archivo), 'utf8'));
  } catch {
    return vacio;
  }
}

// Una sola consulta a la vez: si la caché vence con muchas visitas, todas esperan la misma
let enCurso = null;

function productos() {
  if (cache.productos && Date.now() - cache.cuando < CACHE_MS) return Promise.resolve(cache.productos);
  enCurso ??= leerProductos().finally(() => {
    enCurso = null;
  });
  return enCurso;
}

async function leerProductos() {
  const [filas] = await pool.query(
    'SELECT id, producto, precio, descripcion, categoria FROM producto ORDER BY id',
  );
  const analisis = {
    fotos: new Set(deFotos('fotos.json', [])),
    colores: deFotos('colores.json', {}),
    lomos: new Set(deFotos('lomos.json', [])),
  };
  cache = { cuando: Date.now(), productos: filas.map((f) => aProducto(f, analisis)) };
  return cache.productos;
}

const app = express();
app.disable('x-powered-by');
if (PRODUCCION) app.set('env', 'production'); // errores sin trazas

// Detrás de un proxy con HTTPS (Nginx, Caddy, Cloudflare…): TRUST_PROXY=1 para leer la IP real
// y el protocolo original. Sin proxy se deja apagado para que nadie falsifique X-Forwarded-For.
if (process.env.TRUST_PROXY) app.set('trust proxy', Number(process.env.TRUST_PROXY) || process.env.TRUST_PROXY);

if (HTTPS) {
  app.use((req, res, next) => (req.secure ? next() : res.redirect(301, `https://${req.hostname}${req.originalUrl}`)));
}

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        // Angular inyecta los estilos de cada componente en <style>
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:'],
        fontSrc: ["'self'"],
        connectSrc: ["'self'"],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
        frameAncestors: ["'none'"],
        upgradeInsecureRequests: HTTPS ? [] : null,
      },
    },
    // HSTS solo tiene sentido servido por HTTPS
    strictTransportSecurity: HTTPS ? { maxAge: 31_536_000, includeSubDomains: true } : false,
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    xFrameOptions: { action: 'deny' },
  }),
);

app.use(
  '/api',
  rateLimit({
    windowMs: 60_000,
    limit: 120,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: { error: 'Demasiadas solicitudes. Intenta de nuevo en un momento.' },
  }),
);

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
