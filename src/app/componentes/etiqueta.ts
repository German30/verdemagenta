import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Producto } from '../modelos';
import { CatalogoService } from '../servicios/catalogo';
import { PedidoService } from '../servicios/pedido';
import { PrecioPipe } from '../util/formato';
import { Icono } from './icono';
import { Foto } from './foto';

/** Tarjeta de muestrario: la tarjeta de producto del sitio. */
@Component({
  selector: 'app-etiqueta',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Foto, Icono, PrecioPipe],
  templateUrl: './etiqueta.html',
  styleUrl: './etiqueta.scss',
  host: {
    '[class.meciendo]': 'meciendo()',
    '[class.elegida]': 'enPedido() > 0',
  },
})
export class Etiqueta {
  private readonly catalogo = inject(CatalogoService);
  protected readonly pedido = inject(PedidoService);

  readonly producto = input.required<Producto>();

  protected readonly meciendo = signal(false);
  protected readonly enPedido = computed(() => this.pedido.cantidad(this.producto().id));
  protected readonly grosor = computed(() => this.catalogo.grosor(this.producto().grosor));
  protected readonly ancho = computed(() => this.catalogo.ancho(this.producto()));
  protected readonly acabadoVisible = computed(() => {
    const a = this.producto().acabado;
    return a && a !== 'Liso' ? a : null;
  });

  constructor() {
    let temporizador: ReturnType<typeof setTimeout> | undefined;
    effect((onCleanup) => {
      const aviso = this.pedido.aviso();
      if (aviso?.producto.id !== this.producto().id) return;
      this.meciendo.set(false);
      requestAnimationFrame(() => this.meciendo.set(true));
      temporizador = setTimeout(() => this.meciendo.set(false), 800);
      onCleanup(() => clearTimeout(temporizador));
    });
  }
}
