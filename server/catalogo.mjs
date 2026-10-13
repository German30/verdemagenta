import { ACABADOS, muestraDe } from './colores.mjs';

// Grosores en el orden en que se muestran. `ancho` es el ancho real de la tira en cm.
export const GROSORES = [
  { id: '2-5', nombre: '2.5 cm', ancho: 2.5, categoria: 'TRAPILLO 2.5 CMS' },
  { id: '3', nombre: '3 cm', ancho: 3, categoria: 'TRAPILLO 3 CMS' },
  { id: '4-5', nombre: '4.5 cm', ancho: 4.5, categoria: 'TRAPILLO 4.5 CMS' },
  { id: '6', nombre: '6 cm', ancho: 6, categoria: 'TRAPILLO 6 CMS' },
  { id: 'jumbo-20', nombre: 'Jumbo 20 cm', ancho: 20, categoria: 'TRAPILLO JUMBO 20 CMS' },
];

const POR_CATEGORIA = new Map(GROSORES.map((g) => [g.categoria, g]));

// "Rollo Trapillo Gold 2.5 cm – Azul Petróleo" -> "Azul Petróleo"
function colorDe(nombre) {
  const partes = nombre.split(/\s[–—-]\s/);
  return partes.length > 1 ? partes.at(-1).trim() : null;
}

// "Rollo Trapillo Gold 2.5 cm – Azul" -> "Trapillo Gold"
function lineaDe(nombre) {
  const m = nombre.match(/Trapillo\s+(\w+)/i);
  return m ? `Trapillo ${m[1]}` : null;
}

/** Convierte una fila de `producto` en el modelo que consume el sitio. */
export function aProducto(fila, fotos = new Set()) {
  const categoria = (fila.categoria ?? '').trim().toUpperCase();
  const grosor = POR_CATEGORIA.get(categoria) ?? null;
  const color = grosor ? colorDe(fila.producto) : null;
  const muestra = color
    ? muestraDe(color)
    : { base: '#C9A23A', familia: null, patron: 'metalico', acentos: [] };

  return {
    id: fila.id,
    nombre: fila.producto,
    titulo: color ?? fila.producto,
    linea: grosor ? lineaDe(fila.producto) : null,
    precio: Number(fila.precio),
    descripcion: fila.descripcion ?? '',
    categoria,
    tipo: grosor ? 'trapillo' : 'accesorio',
    grosor: grosor?.id ?? null,
    color,
    familia: muestra.familia,
    acabado: grosor ? ACABADOS[muestra.patron] ?? 'Liso' : null,
    muestra: { base: muestra.base, patron: muestra.patron, acentos: muestra.acentos },
    // Ruta base: el sitio pide <foto>-480.webp y <foto>-960.webp
    foto: fotos.has(fila.id) ? `/fotos/${fila.id}` : null,
  };
}
