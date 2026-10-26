// Prepara las fotos de producto para la web.
// Toma los originales de FOTOS_ORIGEN (por defecto src/app/resources), cuyo nombre de archivo
// es el nombre del producto en la BD, y escribe public/fotos/<id>-480.webp y <id>-960.webp
// más public/fotos/fotos.json con los ids que tienen foto.
//
//   npm run fotos
import sharp from 'sharp';
import { mkdir, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { crearPool } from './bd.mjs';

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const origen = path.resolve(raiz, process.env.FOTOS_ORIGEN ?? 'src/app/resources');
const destino = path.resolve(raiz, 'public/fotos');
const ANCHOS = [480, 960];
const EXTENSIONES = /\.(jpe?g|png|webp)$/i;

// "Rollo Trapillo Gold 2.5 cm – Azul Petróleo" y sus variantes de guion, espacios o tildes
const clave = (s) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[–—-]/g, '-')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();

const pool = crearPool();

const [productos] = await pool.query('SELECT id, producto FROM producto');
await pool.end();
const porNombre = new Map(productos.map((p) => [clave(p.producto), p]));

const archivos = (await readdir(origen)).filter((f) => EXTENSIONES.test(f));
await mkdir(destino, { recursive: true });

const conFoto = [];
const sinProducto = [];
for (const archivo of archivos) {
  const producto = porNombre.get(clave(archivo.replace(EXTENSIONES, '')));
  if (!producto) {
    sinProducto.push(archivo);
    continue;
  }
  for (const ancho of ANCHOS) {
    await sharp(path.join(origen, archivo))
      .rotate()
      .resize({ width: ancho, height: Math.round((ancho * 4) / 3), fit: 'cover', position: 'attention' })
      .webp({ quality: 78, effort: 5 })
      .toFile(path.join(destino, `${producto.id}-${ancho}.webp`));
  }
  conFoto.push(producto.id);
  process.stdout.write('.');
}

conFoto.sort((a, b) => a - b);
await writeFile(path.join(destino, 'fotos.json'), JSON.stringify(conFoto) + '\n');

const sinFoto = productos.filter((p) => !conFoto.includes(p.id));
console.log(`\n${conFoto.length} fotos listas en public/fotos`);
if (sinProducto.length) console.log(`Sin producto en la BD (${sinProducto.length}):\n  ${sinProducto.join('\n  ')}`);
if (sinFoto.length) console.log(`Productos sin foto (${sinFoto.length}):\n  ${sinFoto.map((p) => p.producto).join('\n  ')}`);
