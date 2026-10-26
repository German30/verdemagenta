// API de solo lectura sobre inventario_vm.producto.
// En producción también sirve el build de Angular (dist/verdemagenta/browser).
import express from 'express';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import { existsSync, readFileSync } from 'node:fs';
import http from 'node:http';
import https from 'node:https';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { crearPool } from './bd.mjs';
import { aProducto, GROSORES } from './catalogo.mjs';
import { abrir, cerrar, clavePublica, ErrorSobre, kid } from './cifrado.mjs';
import { FAMILIAS } from './colores.mjs';

const PUERTO = Number(process.env.PORT ?? 3000);
const CACHE_MS = Number(process.env.CACHE_MS ?? 60_000);
const PRODUCCION = process.env.NODE_ENV === 'production' || process.argv.includes('--produccion');
// HTTPS propio con TLS_CERT y TLS_KEY (rutas a los .pem), o lo pone un proxy (TRUST_PROXY)
const TLS_PROPIO = !!(process.env.TLS_CERT && process.env.TLS_KEY);
const HTTPS = TLS_PROPIO || (PRODUCCION && !!process.env.TRUST_PROXY);

// En producción nada viaja en claro: sin certificado ni proxy con HTTPS no arranca
if (PRODUCCION && !HTTPS) {
  console.error('[api] En producción hace falta HTTPS: define TLS_CERT y TLS_KEY, o TRUST_PROXY detrás de un proxy con HTTPS');
  process.exit(1);
}

// Sin valor por defecto: la API usa un usuario de solo lectura (ver server/usuario-lectura.sql), nunca root
if (!process.env.DB_USER) {
  console.error('[api] Falta DB_USER en .env');
  process.exit(1);
}
if (process.env.DB_USER === 'root') {
  console.warn('[api] Aviso: la API se conecta como root; usa el usuario de solo lectura de server/usuario-lectura.sql');
}

let pool;
try {
  pool = crearPool({ connectionLimit: 5 });
} catch (err) {
  console.error(`[api] ${err.message}`);
  process.exit(1);
}

let cache = { cuando: 0, productos: null };

const raiz = path.dirname(fileURLToPath(import.meta.url));

// Datos sacados de las fotos: fotos.json (ids con foto, `npm run fotos`), colores.json y
// lomos.json (color real y recorte para la carta, `npm run colores-fotos`), rollos.json
// (rollo recortado para el estante, `npm run rollos-fotos`)
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
    rollos: new Set(deFotos('rollos.json', [])),
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

// Las respuestas de la API no se guardan en cachés intermedias ni del navegador
app.use('/api', (_req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});

// Clave pública del servidor para acordar el cifrado (ver cifrado.mjs)
app.get('/api/clave', (_req, res) => res.json({ kid, clave: clavePublica }));

// Todas las consultas pasan cifradas por aquí: { ruta: 'catalogo' } o { ruta: 'producto', id }
async function responder(consulta) {
  try {
    if (consulta?.ruta === 'catalogo') {
      return { estado: 200, cuerpo: { productos: await productos(), grosores: GROSORES, familias: FAMILIAS } };
    }
    if (consulta?.ruta === 'producto') {
      const producto = (await productos()).find((p) => p.id === Number(consulta.id));
      return producto ? { estado: 200, cuerpo: producto } : { estado: 404, cuerpo: { error: 'Producto no encontrado.' } };
    }
    return { estado: 404, cuerpo: { error: 'Consulta desconocida.' } };
  } catch (err) {
    console.error('[api] no se pudo leer inventario_vm:', err.message);
    return { estado: 503, cuerpo: { error: 'El catálogo no está disponible en este momento.' } };
  }
}

app.post('/api/consulta', express.json({ limit: '4kb' }), async (req, res) => {
  let sobre;
  try {
    sobre = abrir(req.body);
  } catch (err) {
    if (err instanceof ErrorSobre) return res.status(err.estado).json({ error: err.message });
    throw err;
  }
  // El código HTTP real va dentro del sobre; por fuera siempre es 200
  res.json(cerrar(await responder(sobre.consulta), sobre.clave));
});

const sitio = path.resolve(raiz, '../dist/verdemagenta/browser');
if (existsSync(sitio)) {
  app.use(express.static(sitio, { index: false, maxAge: '7d' }));
  app.get(/^\/(?!api\/).*/, (_req, res) => res.sendFile(path.join(sitio, 'index.html')));
}

let servidor;
if (TLS_PROPIO) {
  servidor = https.createServer(
    { cert: readFileSync(process.env.TLS_CERT), key: readFileSync(process.env.TLS_KEY), minVersion: 'TLSv1.2' },
    app,
  );
  // HTTP_PORT (opcional, p. ej. 80): solo redirige a HTTPS
  if (process.env.HTTP_PORT) {
    http
      .createServer((req, res) => {
        // Solo nombres de host válidos, para no convertirlo en una redirección abierta
        const pedido = (req.headers.host ?? '').replace(/:\d+$/, '');
        const host = /^[a-z0-9.-]+$/i.test(pedido) ? pedido : 'localhost';
        const puerto = PUERTO === 443 ? '' : `:${PUERTO}`;
        res.writeHead(301, { Location: `https://${host}${puerto}${req.url}` }).end();
      })
      .listen(Number(process.env.HTTP_PORT));
  }
} else {
  servidor = http.createServer(app);
}

servidor.listen(PUERTO, async () => {
  console.log(`[api] Verdemagenta escuchando en ${TLS_PROPIO ? 'https' : 'http'}://localhost:${PUERTO}`);
  try {
    const [[{ n }]] = await pool.query('SELECT COUNT(*) AS n FROM producto');
    console.log(`[api] inventario_vm conectada: ${n} productos`);
  } catch (err) {
    console.error(`[api] No se pudo conectar a MySQL (${err.code ?? err.message}). Revisa DB_* en .env`);
  }
});
