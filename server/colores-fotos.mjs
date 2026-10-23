// Saca de cada foto de producto el color real del trapillo y un recorte para el lomo de la carta.
// Lee public/fotos/<id>-480.webp (los ids de public/fotos/fotos.json) y escribe
// public/fotos/colores.json con { "<id>": "#rrggbb" }, public/fotos/<id>-lomo.webp
// y public/fotos/lomos.json con los ids que tienen recorte.
//
//   npm run colores-fotos
import sharp from 'sharp';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const fotos = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../public/fotos');

function hsl(r, g, b) {
  const max = Math.max(r, g, b) / 255;
  const min = Math.min(r, g, b) / 255;
  const l = (max + min) / 2;
  const croma = max - min;
  if (!croma) return { h: 0, croma, l };
  const [R, G, B] = [r / 255, g / 255, b / 255];
  const h = max === R ? ((G - B) / croma + 6) % 6 : max === G ? (B - R) / croma + 2 : (R - G) / croma + 4;
  return { h: h * 60, croma, l };
}

/**
 * El trapillo es lo que más área ocupa con color de verdad: se descartan el fondo
 * blanco/gris, las sombras y la madera clara de las agujas; luego gana el tono
 * (en franjas de 12°) con más píxeles y se promedia ese grupo.
 */
async function colorDominante(archivo) {
  const { data, info } = await sharp(archivo).resize(120, 160, { fit: 'fill' }).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const grupos = new Map();
  for (let i = 0; i < info.width * info.height; i++) {
    const r = data[i * 3], g = data[i * 3 + 1], b = data[i * 3 + 2];
    const { h, croma, l } = hsl(r, g, b);
    if (croma < 0.09 || l > 0.93 || l < 0.08) continue;
    // madera de las agujas: tono crema poco saturado
    if (h > 25 && h < 48 && croma < 0.22 && l > 0.6) continue;
    const franja = Math.floor(h / 12);
    const grupo = grupos.get(franja) ?? [];
    grupo.push([r, g, b, l]);
    grupos.set(franja, grupo);
  }
  if (!grupos.size) return null;
  // Une cada franja con sus vecinas para no partir un color entre dos franjas
  const total = (f) => [-1, 0, 1].reduce((s, d) => s + (grupos.get((f + d + 30) % 30)?.length ?? 0), 0);
  const mejor = [...grupos.keys()].sort((a, b) => total(b) - total(a))[0];
  const pixeles = [mejor - 1, mejor, mejor + 1].flatMap((f) => grupos.get((f + 30) % 30) ?? []);
  // Grises, negros y blancos no tienen un tono dominante: mejor no adivinar
  if (pixeles.length < info.width * info.height * 0.06) return null;
  // La cara iluminada del rollo: sin las sombras ni los brillos (percentiles 45–90 de luz)
  pixeles.sort((a, b) => a[3] - b[3]);
  const luz = pixeles.slice(Math.floor(pixeles.length * 0.45), Math.floor(pixeles.length * 0.9));
  const hex = (c) => Math.round(luz.reduce((s, p) => s + p[c], 0) / luz.length).toString(16).padStart(2, '0');
  return `#${hex(0)}${hex(1)}${hex(2)}`;
}

const hexARgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));

/**
 * Busca en la foto la franja con más trapillo y menos cambios de luz (la cara del
 * rollo o la tira que cuelga), en vertical u horizontal, y la recorta con la forma
 * de un lomo de la carta. Si ninguna franja es casi toda trapillo devuelve null y
 * el sitio dibuja el lomo con su color.
 */
async function recorteLomo(archivo, colorHex) {
  const TW = 120, TH = 160; // miniatura de la foto de 480×640
  const { data } = await sharp(archivo).resize(TW, TH, { fit: 'fill' }).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const objetivo = colorHex ? hsl(...hexARgb(colorHex)) : null;
  // El fondo de la foto (blanco, gris o madera) es el color mediano de sus orillas
  const orilla = [];
  for (let x = 0; x < TW; x++) orilla.push(x, (TH - 1) * TW + x);
  for (let y = 0; y < TH; y++) orilla.push(y * TW, y * TW + TW - 1);
  const mediana = (c) => orilla.map((i) => data[i * 3 + c]).sort((a, b) => a - b)[orilla.length >> 1];
  const fondoRgb = [mediana(0), mediana(1), mediana(2)];
  const N = TW * TH, esTrapillo = new Float32Array(N), luz = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    const p = hsl(data[i * 3], data[i * 3 + 1], data[i * 3 + 2]);
    luz[i] = p.l;
    const cercaDelFondo = Math.hypot(...fondoRgb.map((v, c) => v - data[i * 3 + c])) < 34;
    const fondo = cercaDelFondo || (p.l > 0.8 && p.croma < 0.12);
    if (objetivo) {
      const dh = Math.min(Math.abs(p.h - objetivo.h), 360 - Math.abs(p.h - objetivo.h));
      esTrapillo[i] = !fondo && dh < 22 && p.croma > objetivo.croma * 0.45 ? 1 : 0;
    } else {
      const madera = p.h > 25 && p.h < 50 && p.croma < 0.28 && p.l > 0.5;
      esTrapillo[i] = !fondo && !madera && p.croma < 0.16 ? 1 : 0;
    }
  }
  // Tablas acumuladas para sumar cualquier ventana en tiempo constante
  const acumular = (v) => {
    const I = new Float64Array((TW + 1) * (TH + 1));
    for (let y = 0; y < TH; y++) for (let x = 0; x < TW; x++) {
      I[(y + 1) * (TW + 1) + x + 1] = v[y * TW + x] + I[y * (TW + 1) + x + 1] + I[(y + 1) * (TW + 1) + x] - I[y * (TW + 1) + x];
    }
    return I;
  };
  const It = acumular(esTrapillo), Il = acumular(luz), Il2 = acumular(luz.map((v) => v * v));
  const suma = (I, x, y, w, h) => I[(y + h) * (TW + 1) + x + w] - I[y * (TW + 1) + x + w] - I[(y + h) * (TW + 1) + x] + I[y * (TW + 1) + x];
  let mejor = null;
  for (const [w, h] of [[14, 56], [56, 14], [12, 48], [48, 12]]) {
    for (let y = 0; y + h <= TH; y += 2) for (let x = 0; x + w <= TW; x += 2) {
      const n = w * h, trapillo = suma(It, x, y, w, h) / n;
      const media = suma(Il, x, y, w, h) / n, desvio = Math.sqrt(Math.max(0, suma(Il2, x, y, w, h) / n - media * media));
      const nota = trapillo - desvio * 0.8 + (n / (56 * 14)) * 0.02;
      if (!mejor || nota > mejor.nota) mejor = { nota, trapillo, media, x, y, w, h };
    }
  }
  if (mejor.trapillo < 0.9) return null;
  // Sin tono propio, un recorte claro no se distingue de un fondo blanco o gris: solo neutros oscuros
  if (!objetivo && mejor.media > 0.55) return null;
  // Última revisión: si la franja elegida se parece al fondo, era fondo en sombra
  const promedio = [0, 1, 2].map((c) => {
    let s = 0;
    for (let y = mejor.y; y < mejor.y + mejor.h; y++) for (let x = mejor.x; x < mejor.x + mejor.w; x++) s += data[(y * TW + x) * 3 + c];
    return s / (mejor.w * mejor.h);
  });
  if (Math.hypot(...fondoRgb.map((v, c) => v - promedio[c])) < 45) return null;
  return recortar(archivo, { left: mejor.x, top: mejor.y, width: mejor.w, height: mejor.h }, mejor.w > mejor.h);
}

/**
 * Plan B para trapillos blancos, pastel o estampados, que no tienen un tono que
 * buscar: se localiza el hueco del rollo (mancha pequeña con un anillo de tela
 * uniforme alrededor) y se toma la franja que va del tubo de cartón a la orilla.
 */
async function recortePorHueco(archivo) {
  const TW = 120, TH = 160;
  const { data } = await sharp(archivo).resize(TW, TH, { fit: 'fill' }).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const L = new Float32Array(TW * TH);
  for (let i = 0; i < TW * TH; i++) L[i] = (0.299 * data[i * 3] + 0.587 * data[i * 3 + 1] + 0.114 * data[i * 3 + 2]) / 255;
  let hueco = null;
  for (let cy = 20; cy < 110; cy++) for (let cx = 25; cx < 95; cx++) for (const rh of [4, 5, 6, 7, 8, 9, 10]) {
    const anillo = rh * 4;
    if (cx - anillo < 0 || cx + anillo >= TW || cy - anillo < 0 || cy + anillo >= TH) continue;
    let sh = 0, nh = 0, sa = 0, sa2 = 0, na = 0;
    for (let dy = -anillo; dy <= anillo; dy++) for (let dx = -anillo; dx <= anillo; dx++) {
      const d = Math.hypot(dx, dy), v = L[(cy + dy) * TW + cx + dx];
      if (d <= rh * 0.8) { sh += v; nh++; }
      else if (d >= rh * 1.6 && d <= anillo) { sa += v; sa2 += v * v; na++; }
    }
    const mh = sh / nh, ma = sa / na, desvio = Math.sqrt(Math.max(0, sa2 / na - ma * ma));
    const nota = Math.abs(mh - ma) - desvio * 1.5;
    if (!hueco || nota > hueco.nota) hueco = { nota, cx, cy, rh };
  }
  const { cx, cy, rh } = hueco;
  const color = (x, y) => {
    const c = [0, 0, 0];
    for (let j = -1; j <= 1; j++) for (let i = -1; i <= 1; i++) for (let k = 0; k < 3; k++) c[k] += data[((y + j) * TW + x + i) * 3 + k] / 9;
    return c;
  };
  const distancia = (p, q) => Math.hypot(p[0] - q[0], p[1] - q[1], p[2] - q[2]);
  // El rollo mide unas 5 veces el radio del hueco: la franja no pasa de su orilla
  const tope = Math.round(rh * 4.8);
  let franja = null;
  for (const [dx, dy] of [[1, 0], [-1, 0], [0, -1], [0, 1]]) {
    const punto = (d) => [cx + dx * d, cy + dy * d];
    const [xt, yt] = punto(tope);
    if (xt < 2 || yt < 2 || xt >= TW - 2 || yt >= TH - 2) continue;
    // La tela es el color de la parte exterior del rollo; desde el hueco se avanza
    // hasta dejar atrás el tubo de cartón
    const tela = color(...punto(tope - 2));
    const carton = (c) => { const p = hsl(...c); return p.h > 18 && p.h < 45 && p.croma > 0.1 && p.l > 0.12 && p.l < 0.75; };
    let inicio = Math.round(rh * 1.8);
    while (inicio < tope - 6 && (distancia(color(...punto(inicio)), tela) > 40 || carton(color(...punto(inicio))))) inicio++;
    // Si el hueco deja ver un fondo claro, el detector lo cree más chico: el aro de
    // cartón que aparezca en el camino marca dónde empieza de verdad la tela
    for (let d = Math.round(rh * 0.8); d < tope * 0.6; d++) if (carton(color(...punto(d)))) inicio = Math.max(inicio, d + 1);
    // Margen: el cuarto más cercano al hueco se descarta para no rozar el tubo
    inicio += 4 + Math.round((tope - inicio) * 0.25);
    const largo = tope - inicio;
    if (largo >= 6 && (!franja || largo > franja.largo)) franja = { dx, dy, largo, inicio };
  }
  if (!franja) return null;
  const { dx, dy, largo, inicio } = franja, grueso = Math.max(4, Math.round(largo / 4));
  const rect = dx
    ? { left: dx > 0 ? cx + inicio : cx - inicio - largo, top: cy - (grueso >> 1), width: largo, height: grueso }
    : { left: cx - (grueso >> 1), top: dy > 0 ? cy + inicio : cy - inicio - largo, width: grueso, height: largo };
  return recortar(archivo, rect, dx !== 0);
}

// Recorta un rectángulo de la miniatura (120×160) en la foto grande (960×1280) y lo deja
// de pie como lomo (34×136 al doble de densidad); las franjas horizontales se giran
async function recortar(archivo, rect, girar) {
  const ESCALA = 8;
  const franja = await sharp(archivo.replace('-480.webp', '-960.webp'))
    .extract({ left: rect.left * ESCALA, top: rect.top * ESCALA, width: rect.width * ESCALA, height: rect.height * ESCALA })
    .toBuffer();
  return sharp(franja).rotate(girar ? 90 : 0).resize(68, 272, { fit: 'cover' }).webp({ quality: 74 }).toBuffer();
}

const ids = JSON.parse(await readFile(path.join(fotos, 'fotos.json'), 'utf8'));
const colores = {};
const lomos = [];
for (const id of ids) {
  const archivo = path.join(fotos, `${id}-480.webp`);
  const color = await colorDominante(archivo);
  if (color) colores[id] = color;
  const lomo = (await recorteLomo(archivo, color)) ?? (await recortePorHueco(archivo));
  if (lomo) {
    await writeFile(path.join(fotos, `${id}-lomo.webp`), lomo);
    lomos.push(id);
  }
}
await writeFile(path.join(fotos, 'colores.json'), JSON.stringify(colores, null, 2) + '\n');
await writeFile(path.join(fotos, 'lomos.json'), JSON.stringify(lomos) + '\n');
console.log(`colores.json: ${Object.keys(colores).length} de ${ids.length} fotos`);
console.log(`lomos.json: ${lomos.length} de ${ids.length} fotos`);
