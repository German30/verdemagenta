import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Aviso } from './componentes/aviso';
import { Cabecera } from './componentes/cabecera';
import { Pie } from './componentes/pie';

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, Cabecera, Pie, Aviso],
  template: `
    <app-cabecera />
    <main id="contenido" tabindex="-1">
      <router-outlet />
    </main>
    <app-pie />
    <app-aviso />
  `,
  styles: `
    :host { display: flex; flex-direction: column; min-height: 100dvh; }
    main { flex: 1; outline: none; }
  `,
})
export class App {}
