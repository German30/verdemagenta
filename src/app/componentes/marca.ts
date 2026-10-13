import { ChangeDetectionStrategy, Component } from '@angular/core';

/** Logotipo provisional: palabra con las dos mitades de la marca. Reemplazar por el logo real. */
@Component({
  selector: 'app-marca',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    :host {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      font-variation-settings: 'wdth' 88;
      font-weight: 850;
      font-size: 1.35rem;
      line-height: 1;
      letter-spacing: -0.02em;
      color: var(--marca-texto, var(--ciruela-800));
    }
    .punto {
      width: 22px;
      height: 22px;
      border-radius: 50%;
      background: conic-gradient(var(--menta-500) 0 50%, var(--magenta-500) 0);
    }
    b { font-weight: inherit; color: var(--marca-acento, var(--magenta-500)); }
  `,
  template: `<span class="punto" aria-hidden="true"></span><span>verde<b>magenta</b></span>`,
})
export class Marca {}
