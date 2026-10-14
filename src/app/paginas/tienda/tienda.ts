import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  viewChild,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Params, Router, RouterLink } from '@angular/router';
import { Etiqueta } from '../../componentes/etiqueta';
import { Icono } from '../../componentes/icono';
import { Foto } from '../../componentes/foto';
import { Producto } from '../../modelos';
import { CatalogoService } from '../../servicios/catalogo';
import { PedidoService } from '../../servicios/pedido';
import { PrecioPipe } from '../../util/formato';

const POR_PAGINA = 24;
const ACABADOS = ['Liso', 'Metálico', 'Polipiel', 'Texturizado', 'Estampado', 'Neón'];
const ORDENES = [
  { id: '', nombre: 'Orden predeterminado' },
  { id: 'precio-asc', nombre: 'Precio: menor a mayor' },
  { id: 'precio-desc', nombre: 'Precio: mayor a menor' },
  { id: 'nombre', nombre: 'Color: A a Z' },
];

const lista = (v: string | null) => (v ? v.split(',').filter(Boolean) : []);
const numero = (v: string | null) => (v != null && v !== '' && !isNaN(+v) ? +v : null);
const sinTildes = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

@Component({
  selector: 'app-tienda',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, NgTemplateOutlet, Etiqueta, Icono, Foto, PrecioPipe],
  templateUrl: './tienda.html',
  styleUrl: './tienda.scss',
})
export class Tienda {
  protected readonly catalogo = inject(CatalogoService);
  protected readonly pedido = inject(PedidoService);
  private readonly router = inject(Router);
  private readonly ruta = inject(ActivatedRoute);

  private readonly dialogo = viewChild<ElementRef<HTMLDialogElement>>('dialogo');
  private readonly resultados = viewChild<ElementRef<HTMLElement>>('resultados');

  protected readonly acabados = ACABADOS;
  protected readonly ordenes = ORDENES;

  private readonly qp = toSignal(this.ruta.queryParamMap, { requireSync: true });

  protected readonly f = computed(() => {
    const q = this.qp();
    return {
      grosor: q.get('grosor'),
      familias: lista(q.get('familia')),
      acabados: lista(q.get('acabado')),
      color: q.get('color'),
      q: q.get('q') ?? '',
      min: numero(q.get('min')),
      max: numero(q.get('max')),
      orden: q.get('orden') ?? '',
      vista: q.get('vista') === 'lista' ? 'lista' : 'cuadricula',
      pagina: Math.max(1, numero(q.get('pagina')) ?? 1),
    };
  });

  protected readonly activos = computed(() => {
    const f = this.f();
    return (
      (f.grosor ? 1 : 0) +
      f.familias.length +
      f.acabados.length +
      (f.color ? 1 : 0) +
      (f.q ? 1 : 0) +
      (f.min != null || f.max != null ? 1 : 0)
    );
  });

  protected readonly filtrados = computed(() => {
    const f = this.f();
    const texto = sinTildes(f.q.trim());
    let r = this.catalogo.productos().filter((p) => {
      if (f.grosor && p.grosor !== f.grosor) return false;
      if (f.familias.length && !f.familias.includes(p.familia ?? '')) return false;
      if (f.acabados.length && !f.acabados.includes(p.acabado ?? '')) return false;
      if (f.color && p.color !== f.color) return false;
      if (f.min != null && p.precio < f.min) return false;
      if (f.max != null && p.precio > f.max) return false;
      if (texto && !sinTildes(`${p.nombre} ${p.descripcion}`).includes(texto)) return false;
      return true;
    });
    if (f.orden === 'precio-asc') r = [...r].sort((a, b) => a.precio - b.precio || a.id - b.id);
    if (f.orden === 'precio-desc') r = [...r].sort((a, b) => b.precio - a.precio || a.id - b.id);
    if (f.orden === 'nombre') r = [...r].sort((a, b) => a.titulo.localeCompare(b.titulo, 'es') || a.id - b.id);
    return r;
  });

  protected readonly paginas = computed(() => Math.max(1, Math.ceil(this.filtrados().length / POR_PAGINA)));
  protected readonly pagina = computed(() => Math.min(this.f().pagina, this.paginas()));
  protected readonly visibles = computed(() => {
    const i = (this.pagina() - 1) * POR_PAGINA;
    return this.filtrados().slice(i, i + POR_PAGINA);
  });
  protected readonly rango = computed(() => {
    const total = this.filtrados().length;
    const desde = total ? (this.pagina() - 1) * POR_PAGINA + 1 : 0;
    return { desde, hasta: Math.min(total, desde + POR_PAGINA - 1), total };
  });

  /** 1 … 4 5 6 … 9 */
  protected readonly numeros = computed(() => {
    const n = this.paginas();
    const a = this.pagina();
    const set = new Set([1, n, a - 1, a, a + 1].filter((x) => x >= 1 && x <= n));
    const orden = [...set].sort((x, y) => x - y);
    const salida: (number | null)[] = [];
    orden.forEach((x, i) => {
      if (i && x - orden[i - 1] > 1) salida.push(null);
      salida.push(x);
    });
    return salida;
  });

  protected readonly titulo = computed(() => {
    const f = this.f();
    if (f.color) return f.color;
    const g = this.catalogo.grosor(f.grosor);
    return g ? `Trapillo ${g.nombre}` : 'Tienda';
  });

  protected readonly conteoGrosor = computed(() => {
    const m = new Map<string, number>();
    for (const p of this.catalogo.productos()) {
      const k = p.tipo === 'accesorio' ? 'accesorios' : p.grosor!;
      m.set(k, (m.get(k) ?? 0) + 1);
    }
    return m;
  });

  protected readonly conteoAcabado = computed(() => {
    const m = new Map<string, number>();
    for (const p of this.catalogo.trapillos()) m.set(p.acabado!, (m.get(p.acabado!) ?? 0) + 1);
    return m;
  });

  protected ir(cambios: Params, conservarPagina = false): void {
    this.router.navigate([], {
      relativeTo: this.ruta,
      queryParams: { ...cambios, ...(conservarPagina ? {} : { pagina: null }) },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  protected alternar(clave: 'familia' | 'acabado', valor: string): void {
    const actuales = clave === 'familia' ? this.f().familias : this.f().acabados;
    const nuevos = actuales.includes(valor) ? actuales.filter((v) => v !== valor) : [...actuales, valor];
    this.ir({ [clave]: nuevos.length ? nuevos.join(',') : null });
  }

  protected precio(evento: Event): void {
    evento.preventDefault();
    const datos = new FormData(evento.target as HTMLFormElement);
    const min = numero(String(datos.get('min') ?? ''));
    const max = numero(String(datos.get('max') ?? ''));
    this.ir({ min: min ?? null, max: max ?? null });
  }

  protected limpiar(): void {
    this.router.navigate([], {
      relativeTo: this.ruta,
      queryParams: { vista: this.f().vista === 'lista' ? 'lista' : null, orden: this.f().orden || null },
      replaceUrl: true,
    });
  }

  protected irPagina(n: number): void {
    this.ir({ pagina: n === 1 ? null : n }, true);
    this.resultados()?.nativeElement.scrollIntoView({ block: 'start' });
  }

  protected abrirFiltros(): void {
    this.dialogo()?.nativeElement.showModal();
  }

  protected cerrarFiltros(): void {
    this.dialogo()?.nativeElement.close();
  }

  protected ancho(p: Producto): number {
    return this.catalogo.ancho(p);
  }
}
