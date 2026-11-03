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
import { fondoMuestra } from '../../util/color';
import { enlaceWhatsApp, MAYOREO, mensajeConsulta, precioMayoreo, PrecioPipe } from '../../util/formato';
import { Revelar } from '../../util/revelar';

@Component({
  selector: 'app-producto',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Foto, Icono, PrecioPipe, Revelar],
  templateUrl: './producto.html',
  styleUrl: './producto.scss',
})
export class ProductoPagina {
  protected readonly catalogo = inject(CatalogoService);
  protected readonly pedido = inject(PedidoService);
  protected readonly mayoreo = MAYOREO;
  protected readonly precioMayoreo = precioMayoreo;
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


  /** Los demás colores del mismo grosor, colgados en un tablero por familia como en la carta de inicio. */
  protected readonly vecinos = computed(() => {
    const p = this.producto();
    if (!p) return [];
    return this.catalogo
      .productos()
      .filter((x) => (p.tipo === 'accesorio' ? x.tipo === 'accesorio' : x.grosor === p.grosor))
      .map((x) => ({
        producto: x,
        nombre: x.color ?? x.titulo,
        // Los lisos llevan el color real de su foto; los estampados conservan su dibujo
        fondo: (x.muestra.patron === 'liso' ? x.colorFoto : null) ?? fondoMuestra(x.muestra),
      }));
  });

  protected readonly tableros = computed(() => {
    const vecinos = this.vecinos();
    const grupos = this.catalogo
      .familias()
      .map((f) => ({ id: f.id, nombre: f.nombre, colores: vecinos.filter((v) => v.producto.familia === f.id) }));
    // Lo que no tiene familia (accesorios) va en su propio tablero al final
    const sueltos = vecinos.filter((v) => !grupos.some((g) => g.id === v.producto.familia));
    if (sueltos.length) grupos.push({ id: 'otros', nombre: this.grosor() ? 'Otros' : 'Accesorios', colores: sueltos });
    return grupos.filter((g) => g.colores.length);
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
