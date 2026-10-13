import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Catalogo, Familia, Grosor, Producto } from '../modelos';

type Estado = 'cargando' | 'listo' | 'error';

@Injectable({ providedIn: 'root' })
export class CatalogoService {
  private readonly http = inject(HttpClient);
  private readonly datos = signal<Catalogo | null>(null);

  readonly estado = signal<Estado>('cargando');
  readonly productos = computed(() => this.datos()?.productos ?? []);
  readonly grosores = computed(() => this.datos()?.grosores ?? []);
  readonly familias = computed(() => this.datos()?.familias ?? []);

  readonly trapillos = computed(() => this.productos().filter((p) => p.tipo === 'trapillo'));
  readonly accesorios = computed(() => this.productos().filter((p) => p.tipo === 'accesorio'));

  /** Un color por nombre (primera aparición), en el orden de la carta. */
  readonly colores = computed(() => {
    const vistos = new Map<string, Producto>();
    for (const p of this.trapillos()) {
      if (p.color && !vistos.has(p.color)) vistos.set(p.color, p);
    }
    return [...vistos.values()];
  });

  readonly porId = computed(() => new Map(this.productos().map((p) => [p.id, p])));

  constructor() {
    this.cargar();
  }

  cargar(): void {
    this.estado.set('cargando');
    this.http.get<Catalogo>('/api/catalogo').subscribe({
      next: (c) => {
        this.datos.set(c);
        this.estado.set('listo');
      },
      error: () => this.estado.set('error'),
    });
  }

  grosor(id: string | null): Grosor | undefined {
    return this.grosores().find((g) => g.id === id);
  }

  familia(id: string | null): Familia | undefined {
    return this.familias().find((f) => f.id === id);
  }

  /** Ancho real de la tira en cm; los accesorios no tienen. */
  ancho(p: Producto): number {
    return this.grosor(p.grosor)?.ancho ?? 3;
  }
}
