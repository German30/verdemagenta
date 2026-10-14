import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  input,
  linkedSignal,
  signal,
} from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { Icono } from '../../componentes/icono';
import { Foto } from '../../componentes/foto';
import { CatalogoService } from '../../servicios/catalogo';
import { PedidoService } from '../../servicios/pedido';
import { fondoMuestra, tintaSobre } from '../../util/color';
import { enlaceWhatsApp, mensajeConsulta, PrecioPipe } from '../../util/formato';

@Component({
  selector: 'app-producto',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Foto, Icono, PrecioPipe],
  templateUrl: './producto.html',
  styleUrl: './producto.scss',
})
export class ProductoPagina {
  protected readonly catalogo = inject(CatalogoService);
  protected readonly pedido = inject(PedidoService);
  private readonly title = inject(Title);

  readonly id = input.required<string>();

  protected readonly producto = computed(() => this.catalogo.porId().get(Number(this.id())) ?? null);
  protected readonly grosor = computed(() => this.catalogo.grosor(this.producto()?.grosor ?? null));
  protected readonly cantidad = linkedSignal({ source: this.id, computation: () => 1 });
  /** Confirmación breve en el botón después de agregar. */
  protected readonly agregado = signal(false);
  private temporizador?: ReturnType<typeof setTimeout>;
  protected readonly enPedido = computed(() => {
    const p = this.producto();
    return p ? this.pedido.cantidad(p.id) : 0;
  });

  /** El mismo color en cada grosor; null donde no existe. */
  protected readonly variantes = computed(() => {
    const p = this.producto();
    if (!p?.color) return [];
    return this.catalogo.grosores().map((g) => ({
      grosor: g,
      producto: this.catalogo.trapillos().find((x) => x.color === p.color && x.grosor === g.id) ?? null,
    }));
  });


  protected readonly vecinos = computed(() => {
    const p = this.producto();
    if (!p) return [];
    return this.catalogo
      .productos()
      .filter((x) => (p.tipo === 'accesorio' ? x.tipo === 'accesorio' : x.grosor === p.grosor))
      .map((x) => ({ producto: x, fondo: fondoMuestra(x.muestra), tinta: tintaSobre(x.muestra.base) }));
  });

  protected readonly consulta = computed(() => {
    const p = this.producto();
    return p ? enlaceWhatsApp(mensajeConsulta(p)) : '';
  });

  constructor() {
    inject(DestroyRef).onDestroy(() => clearTimeout(this.temporizador));
    effect(() => {
      const p = this.producto();
      if (p) this.title.setTitle(`${p.titulo}${this.grosor() ? ' ' + this.grosor()!.nombre : ''} · Verdemagenta`);
    });
  }

  protected cambiar(delta: number): void {
    this.cantidad.update((n) => Math.max(1, Math.min(99, n + delta)));
  }

  protected agregar(): void {
    const p = this.producto();
    if (!p) return;
    this.pedido.agregar(p, this.cantidad());
    this.agregado.set(true);
    clearTimeout(this.temporizador);
    this.temporizador = setTimeout(() => this.agregado.set(false), 1600);
  }
}
