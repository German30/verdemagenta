import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type NombreIcono =
  | 'pedido'
  | 'menu'
  | 'cerrar'
  | 'whatsapp'
  | 'buscar'
  | 'filtros'
  | 'cuadricula'
  | 'lista'
  | 'mas'
  | 'menos'
  | 'flecha'
  | 'atras'
  | 'quitar'
  | 'listo'
  | 'recargar';

/** Íconos dibujados a mano en un solo trazo de 1.75. */
@Component({
  selector: 'app-icono',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'aria-hidden': 'true' },
  styles: `
    :host { display: inline-flex; width: 1.25em; height: 1.25em; flex: none; }
    svg { width: 100%; height: 100%; fill: none; stroke: currentColor; stroke-width: 1.75; stroke-linecap: round; stroke-linejoin: round; }
  `,
  template: `
    <svg viewBox="0 0 24 24">
      @switch (nombre()) {
        @case ('pedido') {
          <path d="M5 8.5h14l-1.2 11a1.5 1.5 0 0 1-1.5 1.3H7.7a1.5 1.5 0 0 1-1.5-1.3z" />
          <path d="M9 8.5V7a3 3 0 0 1 6 0v1.5" />
        }
        @case ('menu') {
          <path d="M4 7h16M4 12h16M4 17h10" />
        }
        @case ('cerrar') {
          <path d="M6 6l12 12M18 6L6 18" />
        }
        @case ('whatsapp') {
          <path d="M4.2 20l1.3-3.9a8.3 8.3 0 1 1 3 2.8z" />
          <path d="M9 8.3c-.4.9-.2 2.5 1.3 4.2s3.3 2.3 4.2 2l.9-1.3-1.9-1.1-.9.7c-.9-.4-1.7-1.2-2.1-2.1l.7-.9-1.1-1.9z"
            fill="currentColor" stroke-width="1" />
        }
        @case ('buscar') {
          <circle cx="10.5" cy="10.5" r="6" /><path d="M15 15l5 5" />
        }
        @case ('filtros') {
          <path d="M4 7h10M18 7h2M4 17h4M12 17h8" /><circle cx="16" cy="7" r="2" /><circle cx="10" cy="17" r="2" />
        }
        @case ('cuadricula') {
          <rect x="4" y="4" width="6.5" height="6.5" rx="1" /><rect x="13.5" y="4" width="6.5" height="6.5" rx="1" />
          <rect x="4" y="13.5" width="6.5" height="6.5" rx="1" /><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1" />
        }
        @case ('lista') {
          <rect x="4" y="5" width="4" height="4" rx="1" /><rect x="4" y="15" width="4" height="4" rx="1" />
          <path d="M11 7h9M11 17h9" />
        }
        @case ('mas') {
          <path d="M12 5v14M5 12h14" />
        }
        @case ('menos') {
          <path d="M5 12h14" />
        }
        @case ('flecha') {
          <path d="M5 12h14M13 6l6 6-6 6" />
        }
        @case ('atras') {
          <path d="M19 12H5M11 6l-6 6 6 6" />
        }
        @case ('quitar') {
          <path d="M5 7h14M10 7V5h4v2M7 7l.8 12.2a1 1 0 0 0 1 .8h6.4a1 1 0 0 0 1-.8L17 7" />
        }
        @case ('listo') {
          <path d="M5 12.5l4.5 4.5L19 7.5" />
        }
        @case ('recargar') {
          <path d="M19 12a7 7 0 1 1-2.1-5" /><path d="M19 4.5V8h-3.5" />
        }
      }
    </svg>
  `,
})
export class Icono {
  readonly nombre = input.required<NombreIcono>();
}
