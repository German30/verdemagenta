import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CatalogoService } from '../servicios/catalogo';
import { TIENDA } from '../tienda.config';
import { enlaceWhatsApp } from '../util/formato';
import { Icono } from './icono';
import { Marca } from './marca';

@Component({
  selector: 'app-pie',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Icono, Marca],
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
          @if (tienda.correo) {
            <li><a [href]="'mailto:' + tienda.correo">{{ tienda.correo }}</a></li>
          }
          @if (tienda.instagram) {
            <li><a [href]="tienda.instagram" target="_blank" rel="noopener">Instagram</a></li>
          }
          @if (tienda.facebook) {
            <li><a [href]="tienda.facebook" target="_blank" rel="noopener">Facebook</a></li>
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
      margin-top: clamp(64px, 10vw, 120px);
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
}
