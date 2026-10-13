export type Patron =
  | 'liso'
  | 'metalico'
  | 'diamante'
  | 'foil'
  | 'neon'
  | 'polipiel'
  | 'latex'
  | 'jaspe'
  | 'acanalado'
  | 'craquelado'
  | 'mezclilla'
  | 'flores'
  | 'animal'
  | 'corazones'
  | 'chispas'
  | 'bloques'
  | 'chevron';

export interface Muestra {
  base: string;
  patron: Patron;
  acentos: string[];
}

export interface Producto {
  id: number;
  nombre: string;
  titulo: string;
  linea: string | null;
  precio: number;
  descripcion: string;
  categoria: string;
  tipo: 'trapillo' | 'accesorio';
  grosor: string | null;
  color: string | null;
  familia: string | null;
  acabado: string | null;
  muestra: Muestra;
  /** Ruta base de la foto (sin tamaño ni extensión) o null si se dibuja el rollo. */
  foto: string | null;
}

export interface Grosor {
  id: string;
  nombre: string;
  ancho: number;
  categoria: string;
}

export interface Familia {
  id: string;
  nombre: string;
  muestra: string;
}

export interface Catalogo {
  productos: Producto[];
  grosores: Grosor[];
  familias: Familia[];
}

export interface LineaPedido {
  producto: Producto;
  cantidad: number;
}
