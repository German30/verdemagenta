import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CatalogoService } from '../servicios/catalogo';
import { TIENDA } from '../tienda.config';
import { enlaceWhatsApp } from '../util/formato';
import { Icono } from './icono';
import { Marca } from './marca';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faInstagram, faFacebook } from '@fortawesome/free-brands-svg-icons';
import { faEnvelope } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-pie',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Icono, Marca, FaIconComponent],
  host: { class: 'cinta' },
  template: `
    <div class="contenedor rejilla">
      <div class="firma">
        <app-marca />
        <p>Trapillo por color y por grosor. Armas el pedido aquí y lo cerramos contigo por WhatsApp.</p>
        <a class="boton boton--pedido" [href]="whatsapp" target="_blank" rel="noopener">
          <app-icono nombre="whatsapp" /> Escríbenos por WhatsApp
        </a>
      </div>

      <nav aria-label="Trapillo por grosor">
        <h2 class="rotulo">Trapillo</h2>
        <ul>
          @for (g of catalogo.grosores(); track g.id) {
            <li><a routerLink="/tienda" [queryParams]="{ grosor: g.id }">{{ g.nombre }}</a></li>
          }
        </ul>
      </nav>

      <nav aria-label="Ayuda">
        <h2 class="rotulo">Ayuda</h2>
        <ul>
          <li><a routerLink="/" fragment="como-pedir">Cómo pedir</a></li>
          <li><a routerLink="/pedido">Tu pedido</a></li>
          <li><a routerLink="/" fragment="carta">Carta de colores</a></li>
          <li><a routerLink="/privacidad">Aviso de privacidad</a></li>
          
          @if (tienda.instagram || tienda.facebook || tienda.correo) {
            <li class="redes">
              @if (tienda.instagram) {
                <a [href]="tienda.instagram" target="_blank" rel="noopener" aria-label="Instagram"><fa-icon [icon]="faInstagram" /></a>
              }
              @if (tienda.facebook) {
                <a [href]="tienda.facebook" target="_blank" rel="noopener" aria-label="Facebook"><fa-icon [icon]="faFacebook" /></a>
              }
              @if (tienda.correo) {
                <button type="button" class="correo" (click)="copiarCorreo()"
                  [attr.aria-label]="'Copiar correo ' + tienda.correo">
                  <fa-icon [icon]="faEnvelope" />
                  <span class="globo" aria-hidden="true">{{ copiado() ? '¡Correo copiado!' : tienda.correo }}</span>
                </button>
                <span class="solo-lectores" aria-live="polite">{{ copiado() ? 'Correo copiado' : '' }}</span>
              }
            </li>
          }
        </ul>
      </nav>
    </div>
    <div class="contenedor base">
      <p>© {{ anio }} {{ tienda.nombre }}. Precios en pesos mexicanos.</p>
      <p>Los colores en pantalla son aproximados.</p>
    </div>
  `,
  styles: `
    :host {
      display: block;
      padding-top: clamp(40px, 6vw, 72px);
      background-color: var(--ciruela-900);
    }
    .rejilla {
      display: grid;
      grid-template-columns: minmax(0, 1.6fr) repeat(2, minmax(0, 1fr));
      gap: 40px;
    }
    .firma { display: grid; gap: 18px; justify-items: start; max-width: 42ch; }
    .firma p { color: var(--menta-200); }
    app-marca { --marca-texto: #fff; }
    h2 { font-size: 1.15rem; color: #fff; margin-bottom: 12px; }
    ul { margin: 0; padding: 0; list-style: none; display: grid; gap: 4px; }
    nav a {
      display: inline-block; padding: 5px 0; color: var(--menta-200); text-decoration: none;
    }
    nav a:hover { color: #fff; text-decoration: underline; }
    .redes { display: flex; gap: 16px; margin-top: 4px; }
    .redes a { display: grid; place-items: center; min-width: 32px; min-height: 32px; font-size: 1.35rem; }
    .correo {
      position: relative;
      display: grid; place-items: center; min-width: 32px; min-height: 32px;
      padding: 0; border: 0; background: none;
      color: var(--menta-200); font-size: 1.35rem;
    }
    .correo:hover, .correo:focus-visible { color: #fff; }
    /* Alineado a la derecha: en el celular el ícono queda en la columna derecha y centrado se saldría */
    .globo {
      position: absolute; bottom: calc(100% + 10px); right: 0;
      padding: 6px 10px; border-radius: 6px;
      background: #fff; color: var(--ciruela-900);
      font-size: 0.8125rem; font-weight: 600; white-space: nowrap;
      box-shadow: 0 6px 18px -6px rgb(0 0 0 / 0.4);
      opacity: 0; translate: 0 4px; pointer-events: none;
      transition: opacity 0.15s, translate 0.15s;
    }
    .globo::after {
      content: ''; position: absolute; top: 100%; right: 10px;
      border: 6px solid transparent; border-top-color: #fff;
    }
    .correo:hover .globo, .correo:focus-visible .globo { opacity: 1; translate: 0 0; }
    .base {
      display: flex; flex-wrap: wrap; justify-content: space-between; gap: 8px 24px;
      margin-top: 48px; padding-block: 20px 28px;
      border-top: 1px solid rgb(200 240 221 / 0.16);
      font-size: 0.85rem; color: var(--menta-300);
    }
    @media (max-width: 767px) {
      .rejilla { grid-template-columns: 1fr 1fr; }
      .firma { grid-column: 1 / -1; }
    }
  `,
})
export class Pie {
  protected readonly catalogo = inject(CatalogoService);
  protected readonly tienda = TIENDA;
  protected readonly anio = new Date().getFullYear();
  protected readonly whatsapp = enlaceWhatsApp(`¡Hola ${TIENDA.nombre}! Tengo una pregunta.`);
  protected readonly faInstagram = faInstagram;
  protected readonly faFacebook = faFacebook;
  protected readonly faEnvelope = faEnvelope;
  protected readonly copiado = signal(false);
  private espera?: ReturnType<typeof setTimeout>;

  protected async copiarCorreo(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.tienda.correo);
      this.copiado.set(true);
      clearTimeout(this.espera);
      this.espera = setTimeout(() => this.copiado.set(false), 2000);
    } catch {
      // Sin permiso para copiar (p. ej. sitio sin HTTPS): abre el correo como antes
      window.location.href = 'mailto:' + this.tienda.correo;
    }
  }
}
