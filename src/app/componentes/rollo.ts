import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { Muestra } from '../modelos';

let contador = 0;

function hexARgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.replace(/./g, '$&$&') : h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function mezclar(hex: string, con: string, t: number): string {
  const a = hexARgb(hex);
  const b = hexARgb(con);
  const c = a.map((v, i) => Math.round(v + (b[i] - v) * t));
  return `rgb(${c[0]} ${c[1]} ${c[2]})`;
}

function luminancia(hex: string): number {
  const [r, g, b] = hexARgb(hex).map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

const RX = 34;
const RY = 46;
const CY = 60;

/**
 * Rollo de trapillo visto de tres cuartos. El largo del cilindro es el ancho real
 * de la tira, así que un rollo Jumbo se ve más largo que uno de 2.5 cm.
 */
@Component({
  selector: 'app-rollo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'aria-hidden': 'true', class: 'rollo' },
  styles: `
    :host { display: block; aspect-ratio: 140 / 120; }
    svg { width: 100%; height: 100%; overflow: visible; }
  `,
  template: `
    <svg viewBox="0 0 140 120" [style.filter]="brillo()">
      <defs>
        <linearGradient [attr.id]="id + 'cuerpo'" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#fff" [attr.stop-opacity]="claro() ? 0.18 : 0.28" />
          <stop offset="0.38" stop-color="#fff" stop-opacity="0" />
          <stop offset="0.7" stop-color="#000" stop-opacity="0.08" />
          <stop offset="1" stop-color="#000" [attr.stop-opacity]="claro() ? 0.3 : 0.42" />
        </linearGradient>
        <radialGradient [attr.id]="id + 'cara'" cx="0.36" cy="0.3" r="0.85">
          <stop offset="0" stop-color="#fff" [attr.stop-opacity]="brilloso() ? 0.42 : 0.2" />
          <stop offset="0.55" stop-color="#fff" stop-opacity="0" />
          <stop offset="1" stop-color="#000" [attr.stop-opacity]="claro() ? 0.16 : 0.3" />
        </radialGradient>
        <linearGradient [attr.id]="id + 'metal'" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#fff" stop-opacity="0" />
          <stop offset="0.3" stop-color="#fff" stop-opacity="0.55" />
          <stop offset="0.42" stop-color="#fff" stop-opacity="0" />
          <stop offset="0.62" stop-color="#fff" stop-opacity="0.3" />
          <stop offset="0.7" stop-color="#fff" stop-opacity="0" />
        </linearGradient>
        <linearGradient [attr.id]="id + 'aro'" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#f4dc8a" />
          <stop offset="0.45" stop-color="#c9a23a" />
          <stop offset="0.7" stop-color="#fff0b8" />
          <stop offset="1" stop-color="#8e6d1e" />
        </linearGradient>

        @switch (patron()) {
          @case ('flores') {
            <pattern [attr.id]="id + 'pat'" width="22" height="22" patternUnits="userSpaceOnUse">
              <g [attr.fill]="acento(0)">
                <circle cx="6" cy="3.4" r="2.4" /><circle cx="8.6" cy="5.4" r="2.4" />
                <circle cx="7.6" cy="8.4" r="2.4" /><circle cx="4.4" cy="8.4" r="2.4" />
                <circle cx="3.4" cy="5.4" r="2.4" />
              </g>
              <circle cx="6" cy="6" r="1.5" [attr.fill]="acento(1)" />
              <g [attr.fill]="acento(1)" opacity="0.9">
                <circle cx="17" cy="14.2" r="1.7" /><circle cx="18.9" cy="15.7" r="1.7" />
                <circle cx="18.2" cy="17.9" r="1.7" /><circle cx="15.8" cy="17.9" r="1.7" />
                <circle cx="15.1" cy="15.7" r="1.7" />
              </g>
              <circle cx="17" cy="16.3" r="1" [attr.fill]="acento(0)" />
            </pattern>
          }
          @case ('animal') {
            <pattern [attr.id]="id + 'pat'" width="24" height="20" patternUnits="userSpaceOnUse">
              <g [attr.fill]="acento(0)">
                <path d="M3 4c2-2 5-1 5 1s-3 3-5 2-1-2 0-3z" />
                <path d="M15 2c2 0 4 1 3 3s-4 1-4 0 0-3 1-3z" />
                <path d="M9 12c2-1 5 0 4 2s-4 2-5 1 0-2 1-3z" />
                <path d="M19 13c1.5-.5 3 .5 2.5 2s-3 1.5-3 .5.2-2 .5-2.5z" />
                <path d="M2 15c1 0 2 1 1.5 2s-2 .5-2-.5.2-1.5.5-1.5z" />
              </g>
              <g fill="none" [attr.stroke]="acento(0)" stroke-width="1.1" stroke-linecap="round">
                <path d="M11 3.5a3 3 0 0 1 1 3.5" /><path d="M20 8a3 3 0 0 1-3 2" />
                <path d="M4 10a3 3 0 0 0 1 3" />
              </g>
            </pattern>
          }
          @case ('corazones') {
            <pattern [attr.id]="id + 'pat'" width="16" height="16" patternUnits="userSpaceOnUse">
              <path d="M4 3.2c.9-1.2 3-.9 3 .8 0 1.5-2 2.7-3 3.6-1-.9-3-2.1-3-3.6 0-1.7 2.1-2 3-.8z" [attr.fill]="acento(0)" />
              <path d="M12 11.2c.7-.9 2.3-.7 2.3.6 0 1.1-1.5 2-2.3 2.7-.8-.7-2.3-1.6-2.3-2.7 0-1.3 1.6-1.5 2.3-.6z" [attr.fill]="acento(0)" opacity="0.75" />
            </pattern>
          }
          @case ('chispas') {
            <pattern [attr.id]="id + 'pat'" width="14" height="14" patternUnits="userSpaceOnUse">
              <circle cx="3" cy="3" r="1.3" [attr.fill]="acento(0)" />
              <circle cx="10" cy="5" r="1" [attr.fill]="acento(1)" />
              <rect x="6" y="9.5" width="2.6" height="1.2" rx=".5" [attr.fill]="acento(2)" transform="rotate(30 7 10)" />
              <circle cx="12" cy="12" r=".9" [attr.fill]="acento(1)" />
              <rect x="1.5" y="10" width="2.2" height="1" rx=".5" [attr.fill]="acento(0)" transform="rotate(-25 2.6 10.5)" />
            </pattern>
          }
          @case ('chevron') {
            <pattern [attr.id]="id + 'pat'" width="12" height="8" patternUnits="userSpaceOnUse">
              <polyline points="0,6 6,1.5 12,6" fill="none" [attr.stroke]="acento(0)" stroke-width="2" />
            </pattern>
          }
          @case ('bloques') {
            <pattern [attr.id]="id + 'pat'" [attr.width]="acentos().length * 9" height="10" patternUnits="userSpaceOnUse">
              @for (c of acentos(); track $index) {
                <rect [attr.x]="$index * 9" y="0" width="9" height="10" [attr.fill]="c" />
              }
            </pattern>
          }
          @case ('jaspe') {
            <pattern [attr.id]="id + 'pat'" width="7" height="7" patternUnits="userSpaceOnUse">
              <rect x="1" y="1" width="1.4" height="1" fill="#fff" opacity="0.35" />
              <rect x="4.4" y="3.6" width="1.6" height="1" fill="#000" opacity="0.28" />
              <rect x="2.2" y="5.4" width="1.2" height="1" fill="#fff" opacity="0.25" />
              <rect x="5.6" y="0.6" width="1" height="1" fill="#000" opacity="0.2" />
            </pattern>
          }
          @case ('acanalado') {
            <pattern [attr.id]="id + 'pat'" width="4" height="4" patternUnits="userSpaceOnUse">
              <rect width="1.5" height="4" fill="#000" opacity="0.2" />
              <rect x="2" width="0.8" height="4" fill="#fff" opacity="0.16" />
            </pattern>
          }
          @case ('mezclilla') {
            <pattern [attr.id]="id + 'pat'" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <rect width="1.4" height="4" fill="#fff" opacity="0.2" />
              <rect x="2.4" width="0.6" height="4" fill="#000" opacity="0.18" />
            </pattern>
          }
          @case ('craquelado') {
            <pattern [attr.id]="id + 'pat'" width="28" height="26" patternUnits="userSpaceOnUse">
              <g fill="none" [attr.stroke]="acento(0)" stroke-width="0.9" stroke-linejoin="round">
                <path d="M0 6l6 2 4-4 7 3 5-5 6 2" /><path d="M10 4l1 8-5 6 2 8" />
                <path d="M11 12l8 1 3 6 6-1" /><path d="M19 13l1-6" /><path d="M0 19l6-1" />
              </g>
            </pattern>
          }
          @case ('diamante') {
            <pattern [attr.id]="id + 'pat'" width="10" height="10" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="0.9" fill="#fff" opacity="0.95" />
              <circle cx="7" cy="6" r="0.6" fill="#fff" opacity="0.8" />
              <path d="M5 8.2l.4.9.9.4-.9.4-.4.9-.4-.9-.9-.4.9-.4z" fill="#fff" />
            </pattern>
          }
          @case ('foil') {
            <pattern [attr.id]="id + 'pat'" width="14" height="12" patternUnits="userSpaceOnUse">
              <path d="M2 2l3 1-2 2z" [attr.fill]="acento(0)" />
              <path d="M9 6l3.4.6-2.2 2.4z" [attr.fill]="acento(0)" />
              <path d="M4 9l1.6.2-.8 1.4z" [attr.fill]="acento(0)" opacity="0.8" />
            </pattern>
          }
        }
      </defs>

      @if (accesorio()) {
        <ellipse cx="70" cy="108" rx="34" ry="4.5" fill="#000" opacity="0.12" />
        <circle cx="70" cy="60" r="34" fill="none" [attr.stroke]="'url(#' + id + 'aro)'" stroke-width="11"
          stroke-dasharray="196 18" transform="rotate(-70 70 60)" />
        <circle cx="70" cy="60" r="34" fill="none" stroke="#fff" stroke-opacity="0.35" stroke-width="1.4"
          stroke-dasharray="40 174" transform="rotate(-150 70 60)" />
      } @else {
        @if (sombra()) {
          <ellipse [attr.cx]="70" cy="109" [attr.rx]="RX + profundidad() / 2 + 2" ry="5" fill="#000" opacity="0.14" />
        }

        <!-- cuerpo -->
        <path [attr.d]="cuerpo()" [attr.fill]="base()" />
        @if (conPatron()) {
          <path [attr.d]="cuerpo()" [attr.fill]="'url(#' + id + 'pat)'" />
        }
        @if (metalico()) {
          <path [attr.d]="cuerpo()" [attr.fill]="'url(#' + id + 'metal)'" />
        }
        @for (t of pliegues(); track $index) {
          <path [attr.d]="t" fill="none" stroke="#000" stroke-opacity="0.13" stroke-width="1.1" />
        }
        <path [attr.d]="cuerpo()" [attr.fill]="'url(#' + id + 'cuerpo)'" />
        @if (brilloso()) {
          <path [attr.d]="reflejo()" fill="#fff" opacity="0.32" />
        }

        <!-- cara: vueltas del rollo -->
        <ellipse [attr.cx]="cx()" [attr.cy]="CY" [attr.rx]="RX" [attr.ry]="RY" [attr.fill]="base()" />
        @if (patron() === 'bloques') {
          @for (v of vueltas(); track $index) {
            <ellipse [attr.cx]="cx()" [attr.cy]="CY" [attr.rx]="v.rx" [attr.ry]="v.ry" [attr.fill]="acento($index)" />
          }
        } @else if (conPatron()) {
          <ellipse [attr.cx]="cx()" [attr.cy]="CY" [attr.rx]="RX" [attr.ry]="RY" [attr.fill]="'url(#' + id + 'pat)'" />
        }
        @if (metalico()) {
          <ellipse [attr.cx]="cx()" [attr.cy]="CY" [attr.rx]="RX" [attr.ry]="RY" [attr.fill]="'url(#' + id + 'metal)'" />
        }
        @for (v of vueltas(); track $index) {
          <ellipse [attr.cx]="cx() - 0.6" [attr.cy]="CY - 0.6" [attr.rx]="v.rx" [attr.ry]="v.ry" fill="none"
            stroke="#fff" stroke-opacity="0.2" stroke-width="1" />
          <ellipse [attr.cx]="cx()" [attr.cy]="CY" [attr.rx]="v.rx" [attr.ry]="v.ry" fill="none"
            stroke="#000" stroke-opacity="0.17" stroke-width="1.2" />
        }
        <ellipse [attr.cx]="cx()" [attr.cy]="CY" [attr.rx]="RX" [attr.ry]="RY" [attr.fill]="'url(#' + id + 'cara)'" />
        <ellipse [attr.cx]="cx()" [attr.cy]="CY" [attr.rx]="RX - 0.6" [attr.ry]="RY - 0.6" fill="none"
          stroke="#000" stroke-opacity="0.22" stroke-width="1.2" />
        <!-- hueco central -->
        <ellipse [attr.cx]="cx()" [attr.cy]="CY" rx="8" ry="11" [attr.fill]="hueco()" />
        <ellipse [attr.cx]="cx() + 1.6" [attr.cy]="CY + 1.4" rx="5.6" ry="8.4" fill="#000" opacity="0.35" />
      }
    </svg>
  `,
})
export class Rollo {
  readonly muestra = input.required<Muestra>();
  /** Ancho real de la tira en cm. */
  readonly ancho = input(3);
  readonly accesorio = input(false);
  readonly sombra = input(true);

  protected readonly id = `rollo${++contador}-`;
  protected readonly RX = RX;
  protected readonly RY = RY;
  protected readonly CY = CY;

  protected readonly patron = computed(() => this.muestra().patron);
  protected readonly acentos = computed(() => this.muestra().acentos);
  protected readonly base = computed(() => this.muestra().base);
  protected readonly claro = computed(() => luminancia(this.base()) > 0.45);
  protected readonly metalico = computed(() => ['metalico', 'diamante', 'foil'].includes(this.patron()));
  protected readonly brilloso = computed(() => ['polipiel', 'latex', 'metalico', 'neon'].includes(this.patron()));
  protected readonly conPatron = computed(() =>
    ['flores', 'animal', 'corazones', 'chispas', 'chevron', 'bloques', 'jaspe', 'acanalado', 'mezclilla', 'craquelado', 'diamante', 'foil'].includes(
      this.patron(),
    ),
  );

  protected readonly profundidad = computed(() => {
    const a = this.ancho();
    return Math.round(Math.min(56, 10 + a * 2.6 + (a > 10 ? -6 : 0)));
  });
  protected readonly cx = computed(() => 70 + this.profundidad() / 2);

  protected readonly cuerpo = computed(() => {
    const cx = this.cx();
    const atras = cx - this.profundidad();
    return `M${cx},${CY - RY} L${atras},${CY - RY} A${RX} ${RY} 0 0 0 ${atras},${CY + RY} L${cx},${CY + RY} Z`;
  });

  protected readonly reflejo = computed(() => {
    const cx = this.cx();
    const atras = cx - this.profundidad();
    const y1 = CY - RY + 9;
    const y2 = CY - RY + 15;
    return `M${cx - 4},${y1} L${atras + 4},${y1 - 0.5} L${atras + 3},${y2} L${cx - 4},${y2 + 0.5} Z`;
  });

  protected readonly pliegues = computed(() => {
    const cx = this.cx();
    const d = this.profundidad();
    const n = Math.max(1, Math.round(d / 14));
    return Array.from({ length: n }, (_, i) => {
      const x = cx - (d * (i + 1)) / (n + 1);
      return `M${x},${CY - RY} A${RX} ${RY} 0 0 0 ${x},${CY + RY}`;
    });
  });

  protected readonly vueltas = computed(() =>
    Array.from({ length: 6 }, (_, i) => {
      const t = 1 - (i + 1) / 7.2;
      return { rx: +(RX * t + 8 * (1 - t)).toFixed(2), ry: +(RY * t + 11 * (1 - t)).toFixed(2) };
    }),
  );

  protected readonly hueco = computed(() => mezclar(this.base(), '#000000', 0.62));
  protected readonly brillo = computed(() =>
    this.patron() === 'neon' ? `drop-shadow(0 0 10px ${this.base()}88)` : null,
  );

  protected acento(i: number): string {
    const a = this.acentos();
    return a.length ? a[i % a.length] : this.base();
  }
}
