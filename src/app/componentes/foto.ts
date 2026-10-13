import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { Producto } from '../modelos';
import { CatalogoService } from '../servicios/catalogo';
import { Rollo } from './rollo';

/** Foto del producto (WebP 480/960) o, si no hay o falla, el rollo dibujado. */
@Component({
  selector: 'app-foto',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Rollo],
  host: { '[class.con-foto]': 'mostrarFoto()' },
  styles: `
    :host { display: grid; place-items: center; overflow: hidden; }
    img { width: 100%; height: 100%; object-fit: cover; display: block; }
    app-rollo { width: min(78%, 420px); }
  `,
  template: `
    @if (mostrarFoto()) {
      <img
        [src]="producto().foto + '-480.webp'"
        [srcset]="producto().foto + '-480.webp 480w, ' + producto().foto + '-960.webp 960w'"
        [sizes]="tamanos()"
        width="480"
        height="640"
        [attr.loading]="prioridad() ? 'eager' : 'lazy'"
        [attr.fetchpriority]="prioridad() ? 'high' : null"
        decoding="async"
        [alt]="alt()"
        (error)="fallo.set(true)" />
    } @else {
      <app-rollo [muestra]="producto().muestra" [ancho]="catalogo.ancho(producto())"
        [accesorio]="producto().tipo === 'accesorio'" [sombra]="sombra()" />
    }
  `,
})
export class Foto {
  protected readonly catalogo = inject(CatalogoService);

  readonly producto = input.required<Producto>();
  /** Atributo sizes del img; por defecto, una tarjeta de rejilla. */
  readonly tamanos = input('(max-width: 639px) 50vw, 240px');
  readonly prioridad = input(false);
  readonly sombra = input(true);

  protected readonly fallo = signal(false);
  protected readonly mostrarFoto = computed(() => !!this.producto().foto && !this.fallo());
  protected readonly alt = computed(() => {
    const p = this.producto();
    const g = this.catalogo.grosor(p.grosor);
    return g ? `Rollo de trapillo ${p.titulo}, ${g.nombre}` : p.titulo;
  });
}
