import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-no-encontrada',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <div class="contenedor caja">
      <span class="sello">404</span>
      <h1 class="rotulo">Este hilo no lleva a ningún lado</h1>
      <p>La página que buscas no existe o cambió de lugar.</p>
      <a class="boton" routerLink="/tienda">Ir a la tienda</a>
    </div>
  `,
  styles: `
    .caja { display: grid; justify-items: start; gap: 16px; padding-block: 96px 0; }
    .sello { color: var(--magenta-600); }
    h1 { font-size: clamp(2.5rem, 7vw, 5rem); color: var(--ciruela-800); max-width: 14ch; }
    p { color: var(--tinta-2); }
  `,
})
export class NoEncontrada {}
