import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * Logotipo: el sello de pinceladas (public/logo-*.webp, generado desde resources/Logo.jpg)
 * y la firma. La firma usa la letra del logo (Ink Free, de Windows); donde no está
 * instalada entra Kalam, la más parecida de Google Fonts.
 */
@Component({
  selector: 'app-marca',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    :host {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      font-family: 'Ink Free', 'Kalam', cursive;
      font-weight: 700;
      font-size: 1.3rem;
      line-height: 1;
      white-space: nowrap;
      color: var(--marca-texto, #000);
    }
    img {
      width: var(--marca-sello, 44px);
      height: var(--marca-sello, 44px);
      border-radius: 50%;
      background: #fff;
    }
  `,
  template: `<img src="logo-96.webp" srcset="logo-96.webp 1x, logo-192.webp 2x" width="44" height="44" alt="Verde Magenta" />
    <span>By Marisela Sosa</span>`,
})
export class Marca {}
