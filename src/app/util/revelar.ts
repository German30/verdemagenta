import { afterNextRender, Directive, ElementRef, inject, input, signal } from '@angular/core';

/**
 * Marca el elemento con `.por-revelar` y, cuando entra en pantalla, con `.revelado` (una sola vez).
 * Sin IntersectionObserver o con movimiento reducido no oculta nada: el contenido es visible por defecto.
 */
@Directive({
  selector: '[appRevelar]',
  host: {
    '[class.por-revelar]': 'pendiente()',
    '[class.revelado]': 'visto()',
  },
})
export class Revelar {
  /** Fracción del elemento que debe verse para revelarlo. */
  readonly umbral = input(0.2, {
    alias: 'appRevelar',
    transform: (v: number | string) => (v === '' || isNaN(+v) ? 0.2 : +v),
  });

  protected readonly pendiente = signal(false);
  protected readonly visto = signal(false);

  constructor() {
    const el = inject(ElementRef<HTMLElement>).nativeElement;
    afterNextRender(() => {
      const reducido = matchMedia('(prefers-reduced-motion: reduce)').matches;
      // En pestañas ocultas el navegador pausa el observador: mejor no esconder nada
      if (reducido || document.visibilityState !== 'visible' || !('IntersectionObserver' in window)) return;
      // Lo que ya está a la vista al cargar no se esconde
      const caja = el.getBoundingClientRect();
      if (caja.top < innerHeight * 0.9 && caja.bottom > 0) return;

      this.pendiente.set(true);
      const io = new IntersectionObserver(
        ([e]) => {
          if (!e.isIntersecting) return;
          this.pendiente.set(false);
          this.visto.set(true);
          io.disconnect();
        },
        { threshold: this.umbral() },
      );
      io.observe(el);
    });
  }
}
