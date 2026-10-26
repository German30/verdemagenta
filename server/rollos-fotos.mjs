// Recorta en círculo el rollo de cada foto de producto, visto de frente, para el estante
// de la carta de colores. Lee public/fotos/<id>-480.webp (los ids de fotos.json), escribe
// public/fotos/<id>-rollo.webp (192×192 con transparencia) y public/fotos/rollos.json.
//
//   npm run rollos-fotos
import sharp from 'sharp';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const fotos = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../public/fotos');
const TW = 120, TH = 160; // miniatura de la foto de 480×640; la de 960 es 8 veces mayor
const LADO = 192;

/**
 * El hueco del rollo es una mancha pequeña con un anillo de tela uniforme alrededor
 * (mismo criterio que recortePorHueco en colores-fotos.mjs). Búsqueda gruesa cada 2 px
 * y luego se afina alrededor del mejor candidato.
 */
function buscarHueco(data) {
  const L = new Float32Array(TW * TH);
  for (let i = 0; i < TW * TH; i++) L[i] = (0.299 * data[i * 3] + 0.587 * data[i * 3 + 1] + 0.114 * data[i * 3 + 2]) / 255;
  let hueco = null;
  const probar = (cx, cy, rh) => {
    const anillo = rh * 4;
    if (cx - anillo < 0 || cx + anillo >= TW || cy - anillo < 0 || cy + anillo >= TH) return;
    let sh = 0, nh = 0, sa = 0, sa2 = 0, na = 0;
    for (let dy = -anillo; dy <= anillo; dy++) for (let dx = -anillo; dx <= anillo; dx++) {
      const d = Math.hypot(dx, dy), v = L[(cy + dy) * TW + cx + dx];
      if (d <= rh * 0.8) { sh += v; nh++; }
      else if (d >= rh * 1.6 && d <= anillo) { sa += v; sa2 += v * v; na++; }
    }
    const mh = sh / nh, ma = sa / na, desvio = Math.sqrt(Math.max(0, sa2 / na - ma * ma));
    const nota = Math.abs(mh - ma) - desvio * 1.5;
    if (!hueco || nota > hueco.nota) hueco = { nota, cx, cy, rh };
  };
  for (let cy = 20; cy < 110; cy += 2) for (let cx = 25; cx < 95; cx += 2) for (const rh of [4, 6, 8, 10]) probar(cx, cy, rh);
  const g = hueco;
  for (let cy = g.cy - 2; cy <= g.cy + 2; cy++) for (let cx = g.cx - 2; cx <= g.cx + 2; cx++) for (let rh = Math.max(4, g.rh - 1); rh <= g.rh + 1; rh++) probar(cx, cy, rh);
  return hueco;
}

/**
 * Desde el hueco se lanzan rayos hasta donde la tela cambia de color: el radio del rollo
 * es el percentil 40 (las tiras que cuelgan alargan algunos rayos). Se descarta la foto si
 * el rollo es muy chico, se sale del encuadre o el anillo de tela no es parejo (acercamientos
 * al tejido, agujas, tiras sueltas).
 */
async function recorteRollo(archivo) {
  const { data } = await sharp(archivo).resize(TW, TH, { fit: 'fill' }).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const { cx, cy, rh } = buscarHueco(data);
  const color = (x, y) => {
    const c = [0, 0, 0];
    for (let j = -1; j <= 1; j++) for (let i = -1; i <= 1; i++) for (let k = 0; k < 3; k++) c[k] += data[((y + j) * TW + x + i) * 3 + k] / 9;
    return c;
  };
  const dentro = (x, y) => x >= 1 && y >= 1 && x < TW - 1 && y < TH - 1;
  const distancia = (p, q) => Math.hypot(p[0] - q[0], p[1] - q[1], p[2] - q[2]);
  const ANG = 36;
  const rayo = (a, r) => [Math.round(cx + Math.cos((a / ANG) * 2 * Math.PI) * r), Math.round(cy + Math.sin((a / ANG) * 2 * Math.PI) * r)];

  // La tela es la mediana del anillo a 2.6 radios de hueco (ya fuera del tubo de cartón)
  const muestras = [];
  for (let a = 0; a < ANG; a++) {
    const p = rayo(a, rh * 2.6);
    if (dentro(...p)) muestras.push(color(...p));
  }
  const tela = [0, 1, 2].map((k) => muestras.map((m) => m[k]).sort((p, q) => p - q)[muestras.length >> 1]);

  const radios = [];
  for (let a = 0; a < ANG; a++) {
    let r = rh * 2.2, fuera = 0;
    while (r < 80) {
      const p = rayo(a, r);
      if (!dentro(...p)) break;
      if (distancia(color(...p), tela) > 50) { if (++fuera >= 2) break; } else fuera = 0;
      r += 1;
    }
    radios.push(r - fuera);
  }
  radios.sort((p, q) => p - q);
  const R = radios[Math.floor(ANG * 0.4)] * 0.97;
  if (R < 20) return null;

  let parejos = 0, total = 0;
  for (let a = 0; a < ANG; a++) for (const f of [0.5, 0.65, 0.8]) {
    const p = rayo(a, R * f);
    if (!dentro(...p)) continue;
    total++;
    if (distancia(color(...p), tela) < 50) parejos++;
  }
  if (parejos / total < 0.88) return null;

  const E = 8, lado = Math.round(2 * R * E), left = Math.round((cx + 0.5 - R) * E), top = Math.round((cy + 0.5 - R) * E);
  if (left < 0 || top < 0 || left + lado > TW * E || top + lado > TH * E) return null;
  // Recorte en anillo: el hueco queda transparente para que se vea la repisa a través del tubo
  const hueco = ((rh * 0.75) / R) * (LADO / 2);
  const circulo = Buffer.from(
    `<svg width="${LADO}" height="${LADO}"><path fill-rule="evenodd" d="` +
      `M1 ${LADO / 2}a${LADO / 2 - 1} ${LADO / 2 - 1} 0 1 0 ${LADO - 2} 0a${LADO / 2 - 1} ${LADO / 2 - 1} 0 1 0 -${LADO - 2} 0z` +
      `M${LADO / 2 - hueco} ${LADO / 2}a${hueco} ${hueco} 0 1 0 ${2 * hueco} 0a${hueco} ${hueco} 0 1 0 -${2 * hueco} 0z"/></svg>`,
  );
  const cuadro = await sharp(archivo.replace('-480.webp', '-960.webp')).extract({ left, top, width: lado, height: lado }).resize(LADO, LADO).toBuffer();
  return sharp(cuadro).ensureAlpha().composite([{ input: circulo, blend: 'dest-in' }]).webp({ quality: 76, alphaQuality: 90 }).toBuffer();
}

const ids = JSON.parse(await readFile(path.join(fotos, 'fotos.json'), 'utf8'));
const rollos = [];
for (const id of ids) {
  const rollo = await recorteRollo(path.join(fotos, `${id}-480.webp`));
  if (rollo) {
    await writeFile(path.join(fotos, `${id}-rollo.webp`), rollo);
    rollos.push(id);
  }
}
await writeFile(path.join(fotos, 'rollos.json'), JSON.stringify(rollos) + '\n');
console.log(`rollos.json: ${rollos.length} de ${ids.length} fotos`);
