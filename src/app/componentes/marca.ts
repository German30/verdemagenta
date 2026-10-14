import { ChangeDetectionStrategy, Component } from '@angular/core';

/** Logotipo: el sello de pinceladas (public/logo-*.webp, generado desde resources/Logo.jpg) y la palabra. */
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
    img {
      width: var(--marca-sello, 44px);
      height: var(--marca-sello, 44px);
      border-radius: 50%;
      background: #fff;
    }
    b { font-weight: inherit; color: var(--marca-acento, var(--magenta-500)); }
  `,
  template: `<img src="logo-96.webp" srcset="logo-96.webp 1x, logo-192.webp 2x" width="44" height="44" alt="" />
    <span>verde<b>magenta</b></span>`,
})
export class Marca {}
