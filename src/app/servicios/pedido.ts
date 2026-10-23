import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { LineaPedido, Producto } from '../modelos';
import { CatalogoService } from './catalogo';

const CLAVE = 'verdemagenta.pedido';
const MAXIMO = 99;

interface Guardado {
  id: number;
  cantidad: number;
}

export interface Aviso {
  producto: Producto;
  vez: number;
}

function leer(): Guardado[] {
  try {
    const crudo = localStorage.getItem(CLAVE);
    const lista = crudo ? JSON.parse(crudo) : [];
    return Array.isArray(lista)
      ? lista
          .filter((l) => Number.isInteger(l?.id) && Number.isInteger(l?.cantidad) && l.cantidad > 0)
          .map((l) => ({ id: l.id, cantidad: Math.min(MAXIMO, l.cantidad) }))
      : [];
  } catch {
    return [];
  }
}

@Injectable({ providedIn: 'root' })
export class PedidoService {
  private readonly catalogo = inject(CatalogoService);
  private readonly guardado = signal<Guardado[]>(leer());

  /** Último producto agregado, para el aviso y el columpio de la etiqueta. */
  readonly aviso = signal<Aviso | null>(null);

  readonly lineas = computed<LineaPedido[]>(() => {
    const indice = this.catalogo.porId();
    return this.guardado()
      .map((g) => ({ producto: indice.get(g.id)!, cantidad: g.cantidad }))
      .filter((l) => !!l.producto);
  });

  readonly piezas = computed(() => this.lineas().reduce((s, l) => s + l.cantidad, 0));
  readonly total = computed(() => this.lineas().reduce((s, l) => s + l.cantidad * l.producto.precio, 0));

  constructor() {
    effect(() => {
      const datos = this.guardado();
      try {
        localStorage.setItem(CLAVE, JSON.stringify(datos));
      } catch {
        // Sin almacenamiento el pedido vive solo en esta pestaña.
      }
    });
  }

  cantidad(id: number): number {
    return this.guardado().find((g) => g.id === id)?.cantidad ?? 0;
  }

  agregar(producto: Producto, cantidad = 1): void {
    this.guardado.update((lista) => {
      const actual = lista.find((g) => g.id === producto.id);
      if (actual) {
        return lista.map((g) =>
          g.id === producto.id ? { ...g, cantidad: Math.min(MAXIMO, g.cantidad + cantidad) } : g,
        );
      }
      return [...lista, { id: producto.id, cantidad: Math.min(MAXIMO, cantidad) }];
    });
    this.aviso.set({ producto, vez: Date.now() });
  }

  fijar(id: number, cantidad: number): void {
    const n = Math.max(0, Math.min(MAXIMO, Math.round(cantidad) || 0));
    this.guardado.update((lista) =>
      n === 0 ? lista.filter((g) => g.id !== id) : lista.map((g) => (g.id === id ? { ...g, cantidad: n } : g)),
    );
  }

  quitar(id: number): void {
    this.fijar(id, 0);
  }

  vaciar(): void {
    this.guardado.set([]);
  }
}
