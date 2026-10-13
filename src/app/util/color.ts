import { Muestra } from '../modelos';

function canal(v: number): number {
  const s = v / 255;
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}

export function luminancia(hex: string): number {
  const n = parseInt(hex.replace('#', ''), 16);
  return 0.2126 * canal((n >> 16) & 255) + 0.7152 * canal((n >> 8) & 255) + 0.0722 * canal(n & 255);
}

/** Tinta legible encima de un color de muestra. */
export function tintaSobre(hex: string): string {
  return luminancia(hex) > 0.3 ? '#15201a' : '#ffffff';
}

/** Fondo CSS aproximado de una muestra, para lomos y chips. */
export function fondoMuestra(m: Muestra): string {
  const { base, patron, acentos } = m;
  switch (patron) {
    case 'bloques': {
      const paso = 100 / acentos.length;
      return `linear-gradient(180deg, ${acentos.map((c, i) => `${c} ${i * paso}% ${(i + 1) * paso}%`).join(', ')})`;
    }
    case 'flores':
    case 'corazones':
    case 'animal':
    case 'chispas':
      return `radial-gradient(circle at 30% 30%, ${acentos[0]} 0 3px, transparent 3.5px) 0 0 / 14px 14px, radial-gradient(circle at 70% 75%, ${acentos[1] ?? acentos[0]} 0 2.5px, transparent 3px) 0 0 / 14px 14px, ${base}`;
    case 'chevron':
      return `repeating-linear-gradient(135deg, ${base} 0 5px, ${acentos[0]} 5px 7px), ${base}`;
    case 'metalico':
    case 'diamante':
    case 'foil':
      return `linear-gradient(170deg, rgb(255 255 255 / 0) 20%, rgb(255 255 255 / 0.5) 34%, rgb(255 255 255 / 0) 46%, rgb(255 255 255 / 0.22) 64%, rgb(255 255 255 / 0) 72%), ${foil(m)}`;
    case 'jaspe':
    case 'mezclilla':
      return `repeating-linear-gradient(45deg, rgb(255 255 255 / 0.14) 0 1px, transparent 1px 3px), ${base}`;
    case 'acanalado':
      return `repeating-linear-gradient(0deg, rgb(0 0 0 / 0.16) 0 2px, transparent 2px 5px), ${base}`;
    case 'polipiel':
    case 'latex':
      return `linear-gradient(90deg, rgb(255 255 255 / 0) 30%, rgb(255 255 255 / 0.28) 46%, rgb(255 255 255 / 0) 60%), ${base}`;
    default:
      return base;
  }
}

function foil(m: Muestra): string {
  return m.patron === 'foil'
    ? `radial-gradient(circle, ${m.acentos[0]} 0 1px, transparent 1.5px) 0 0 / 7px 9px, ${m.base}`
    : m.base;
}
