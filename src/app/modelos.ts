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
  /** Viene de su grosor: true si no hay inventario y se pide al confirmar. */
  bajoPedido: boolean;
  color: string | null;
  familia: string | null;
  acabado: string | null;
  muestra: Muestra;
  /** Ruta base de la foto (sin tamaño ni extensión) o null si se dibuja el rollo. */
  foto: string | null;
  /** Color real del trapillo tomado de su foto; null si no hay foto o no tiene un tono claro. */
  colorFoto: string | null;
  /** Franja de la foto con solo trapillo para el lomo de la carta; null si no hay una limpia. */
  lomo: string | null;
}

export interface Grosor {
  id: string;
  nombre: string;
  ancho: number;
  categoria: string;
  /** Sin inventario: se pide al proveedor cuando el cliente confirma. */
  bajoPedido: boolean;
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
