// Carta de colores: traduce el nombre de color que viene en `producto.producto`
// a una muestra que el frontend puede pintar. La BD solo guarda el nombre, así que
// estos valores son una aproximación visual y se ajustan aquí cuando haya fotos reales.
//
// patron: cómo se pinta el rollo
//   liso | metalico | diamante | foil | neon | polipiel | latex
//   jaspe | acanalado | craquelado | mezclilla
//   flores | animal | corazones | chispas | bloques | chevron

export const FAMILIAS = [
  { id: 'rosas', nombre: 'Rosas y fucsias', muestra: '#E0247E' },
  { id: 'rojos', nombre: 'Rojos y vinos', muestra: '#B81B2A' },
  { id: 'calidos', nombre: 'Naranjas y amarillos', muestra: '#EE7A1C' },
  { id: 'verdes', nombre: 'Verdes', muestra: '#1E9E78' },
  { id: 'azules', nombre: 'Azules', muestra: '#2F5FB8' },
  { id: 'morados', nombre: 'Lilas y morados', muestra: '#7B3FB8' },
  { id: 'tierras', nombre: 'Tierras y nudes', muestra: '#8A5A36' },
  { id: 'grises', nombre: 'Grises y negros', muestra: '#4A4E54' },
  { id: 'estampados', nombre: 'Estampados', muestra: '#C9A27A' },
];

export const ACABADOS = {
  liso: 'Liso',
  metalico: 'Metálico',
  diamante: 'Liso',
  foil: 'Liso',
  neon: 'Neón',
  polipiel: 'Polipiel',
  latex: 'Polipiel',
  jaspe: 'Texturizado',
  acanalado: 'Texturizado',
  craquelado: 'Metálico',
  mezclilla: 'Texturizado',
  flores: 'Estampado',
  animal: 'Estampado',
  corazones: 'Estampado',
  chispas: 'Estampado',
  bloques: 'Estampado',
  chevron: 'Estampado',
};

// Colores que se pintan con brillo pero la BD no describe como metálicos.
export const ACABADO_POR_COLOR = {
  'Bronce': 'Liso',
  'Bronce Humo': 'Liso',
  'Oro Vintage': 'Liso',
};

// [base, familia, patron, acentos?]
const CARTA = {
  'Amarillo': ['#F2C81B', 'calidos', 'liso'],
  'Amarillo Pastel': ['#F6E39A', 'calidos', 'liso'],
  'Animal Print': ['#C9A27A', 'estampados', 'animal', ['#3A2A1E']],
  'Azul Cielo': ['#8EC3E6', 'azules', 'liso'],
  'Azul Francia': ['#2F5FB8', 'azules', 'liso'],
  'Azul Marino': ['#1E2A4F', 'azules', 'liso'],
  'Azul Petróleo': ['#1F5866', 'azules', 'liso'],
  'Azul Pizarra': ['#4F6478', 'azules', 'liso'],
  'Azul Rey': ['#2340A0', 'azules', 'liso'],
  'Azul Turquesa': ['#1FA7B5', 'azules', 'liso'],
  'Beige': ['#D9C3A3', 'tierras', 'liso'],
  'Beige Diamante': ['#D8C4A6', 'tierras', 'diamante'],
  'Bloque de Color': ['#E2477D', 'estampados', 'bloques', ['#E2477D', '#F2C81B', '#2F5FB8', '#2E9E6A']],
  'Bloque Rosa': ['#F4A7C0', 'estampados', 'bloques', ['#F7D3DF', '#F4A7C0', '#E2477D', '#B8185F']],
  'Bronce': ['#9C6B3A', 'tierras', 'metalico'],
  'Bronce Humo': ['#7D6A5A', 'tierras', 'metalico'],
  'Chedron': ['#F3EFE8', 'estampados', 'chevron', ['#2B2B2B']],
  'Chispas Navideñas': ['#B3202E', 'estampados', 'chispas', ['#1F6B3A', '#F3E7C3', '#D9B24C']],
  'Cocoa': ['#6B4A3A', 'tierras', 'liso'],
  'Colores Intensos': ['#D6247A', 'estampados', 'bloques', ['#D6247A', '#F28C28', '#1FA7B5', '#7A3FB0']],
  'Coral': ['#F2735F', 'calidos', 'liso'],
  'Corazones': ['#F7D3DF', 'estampados', 'corazones', ['#D6247A']],
  'Durazno': ['#F5B593', 'calidos', 'liso'],
  'Flores Azules': ['#E6EEF7', 'estampados', 'flores', ['#2F5FB8', '#8EC3E6']],
  'Flores Café': ['#EFE4D6', 'estampados', 'flores', ['#7A4E35', '#C9A27A']],
  'Flores Lila': ['#F1EAF6', 'estampados', 'flores', ['#9C7BC4', '#D7A6CF']],
  'Flores Rosas': ['#FBEFF3', 'estampados', 'flores', ['#E2477D', '#F4A7C0']],
  'Fucsia Metalico': ['#D11F8C', 'rosas', 'metalico'],
  'Granada': ['#8E1B32', 'rojos', 'liso'],
  'Gris Jaspe': ['#9A9C9E', 'grises', 'jaspe'],
  'Gris Oxford': ['#4A4E54', 'grises', 'liso'],
  'Gris Plata': ['#B7BBBF', 'grises', 'liso'],
  'Ivory': ['#F2ECDD', 'tierras', 'liso'],
  'Kiwi': ['#8DB83A', 'verdes', 'liso'],
  'Lila': ['#B79BD6', 'morados', 'liso'],
  'Lila Metalico': ['#A98BD0', 'morados', 'metalico'],
  'Magenta': ['#D6247A', 'rosas', 'liso'],
  'Magenta Acanalado': ['#C81E72', 'rosas', 'acanalado'],
  'Maquillaje': ['#E3B5A0', 'tierras', 'liso'],
  'Menta Baby': ['#BFE6D3', 'verdes', 'liso'],
  'Mezclilla': ['#3E5F86', 'azules', 'mezclilla'],
  'Moka': ['#7C5A48', 'tierras', 'liso'],
  'Morado': ['#5E2E8C', 'morados', 'liso'],
  'Mostaza': ['#D19A1E', 'calidos', 'liso'],
  'Naranja': ['#EE7A1C', 'calidos', 'liso'],
  'Naranja Neón': ['#FF6A1A', 'calidos', 'neon'],
  'Negro': ['#1C1C1E', 'grises', 'liso'],
  'Negro Craquelado': ['#1C1C1E', 'grises', 'craquelado', ['#55555B']],
  'Negro Foil Oro': ['#1C1C1E', 'grises', 'foil', ['#D4AF37']],
  'Negro Latex': ['#141416', 'grises', 'latex'],
  'Negro Polipiel Mate': ['#232325', 'grises', 'polipiel'],
  'Nuez': ['#8A5A36', 'tierras', 'liso'],
  'Nuez Acanalado': ['#8A5A36', 'tierras', 'acanalado'],
  'Oro Metalico': ['#C9A23A', 'calidos', 'metalico'],
  'Oro Vintage': ['#A88A4A', 'calidos', 'metalico'],
  'Oxford Jaspe': ['#4A4E54', 'grises', 'jaspe'],
  'Plata Craquelado': ['#B9BCC0', 'grises', 'craquelado', ['#7E8186']],
  'Plata Metalico': ['#BFC3C8', 'grises', 'metalico'],
  'Polipiel Canela': ['#A8643A', 'tierras', 'polipiel'],
  'Polipiel Chocolate': ['#4A2C1F', 'tierras', 'polipiel'],
  'Polipiel Ivory': ['#EFE7D6', 'tierras', 'polipiel'],
  'Polipiel Magenta': ['#C8206F', 'rosas', 'polipiel'],
  'Polipiel Rosa Palo': ['#E5B9B5', 'rosas', 'polipiel'],
  'Polipiel Tinto': ['#6B1428', 'rojos', 'polipiel'],
  'Rojo': ['#CF1F2E', 'rojos', 'liso'],
  'Rojo Metalico': ['#B81B2A', 'rojos', 'metalico'],
  'Rosa Baby': ['#F7C9D6', 'rosas', 'liso'],
  'Rosa Barbie': ['#EE4FA0', 'rosas', 'liso'],
  'Rosa Diamante': ['#F2B7C8', 'rosas', 'diamante'],
  'Rosa Fucsia': ['#E0247E', 'rosas', 'liso'],
  'Rosa Humo': ['#C9A3A6', 'rosas', 'liso'],
  'Rosa Humo Acanalado': ['#C9A3A6', 'rosas', 'acanalado'],
  'Rosa Metalico': ['#E79AB6', 'rosas', 'metalico'],
  'Rosa Neon': ['#FF3D9A', 'rosas', 'neon'],
  'Rosa Palo': ['#E8BFC0', 'rosas', 'liso'],
  'Rosa Pastel': ['#F6C6D3', 'rosas', 'liso'],
  'RosaLila': ['#D7A6CF', 'morados', 'liso'],
  'Taupe': ['#8B7D72', 'tierras', 'liso'],
  'Tinto': ['#6E1A2B', 'rojos', 'liso'],
  'Vainilla': ['#F3E5B8', 'calidos', 'liso'],
  'Verde Botella': ['#1F4D3A', 'verdes', 'liso'],
  'Verde Cenizo': ['#8E9B86', 'verdes', 'liso'],
  'Verde Humo': ['#7E9488', 'verdes', 'liso'],
  'Verde Olivo': ['#6B6B2F', 'verdes', 'liso'],
  'Verde Pistache': ['#B5D58A', 'verdes', 'liso'],
  'Verde Tropical': ['#1E9E78', 'verdes', 'liso'],
  'Violeta': ['#7B3FB8', 'morados', 'liso'],
};

const SIN_TILDES = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const INDICE = new Map(Object.entries(CARTA).map(([k, v]) => [SIN_TILDES(k), v]));

/** Muestra para un nombre de color; los desconocidos caen en un gris neutro para no romper la carta. */
export function muestraDe(color) {
  const fila = INDICE.get(SIN_TILDES(color ?? ''));
  if (!fila) return { base: '#A7A9A4', familia: 'grises', patron: 'liso', acentos: [] };
  const [base, familia, patron, acentos = []] = fila;
  return { base, familia, patron, acentos };
}
