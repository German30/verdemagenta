import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CatalogoService } from '../servicios/catalogo';
import { PedidoService } from '../servicios/pedido';
import { Icono } from './icono';
import { Foto } from './foto';

/** Nota que confirma lo agregado y lleva al pedido. */
@Component({
  selector: 'app-aviso',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Foto, Icono],
  template: `
    <div class="caja" role="status" aria-live="polite">
      @if (visible() && actual(); as p) {
        <div class="nota" animate.enter="aparece" animate.leave="se-va">
          <app-foto class="mini" [producto]="p" tamanos="44px" [sombra]="false" />
          <p>
            <strong>{{ p.titulo }}</strong>
            {{ catalogo.grosor(p.grosor)?.nombre ?? '' }} agregado a tu pedido.
          </p>
          <a routerLink="/pedido" (click)="visible.set(false)">Ver pedido</a>
          <button type="button" (click)="visible.set(false)" aria-label="Cerrar aviso">
            <app-icono nombre="cerrar" />
          </button>
        </div>
      }
    </div>
  `,
  styles: `
    .caja {
      position: fixed;
      top: calc(var(--cabecera) + 12px);
      right: var(--gutter);
      z-index: 60;
      width: min(380px, calc(100vw - 32px));
      pointer-events: none;
    }
    .nota {
      display: grid;
      grid-template-columns: 44px 1fr auto auto;
      align-items: center;
      gap: 10px;
      padding: 10px 8px 10px 12px;
      border-radius: var(--radio);
      background: var(--carton);
      box-shadow: var(--sombra-panel);
      border-top: 3px solid var(--magenta-500);
      pointer-events: auto;
    }
    .mini { width: 44px; height: 44px; border-radius: 4px; }
    p { font-size: 0.9rem; line-height: 1.3; }
    a { font-weight: 700; color: var(--magenta-600); font-size: 0.9rem; white-space: nowrap; }
    button {
      display: grid; place-items: center; width: 36px; height: 36px;
      border: 0; border-radius: var(--radio); background: transparent; color: var(--tinta-2);
    }
    button:hover { background: var(--suelo); }
    .aparece { animation: aparece 0.45s var(--salida); }
    .se-va { animation: aparece 0.25s ease-in reverse forwards; }
    @keyframes aparece {
      from { opacity: 0; transform: translateY(-10px); clip-path: inset(0 0 100% 0); }
      to { opacity: 1; transform: none; clip-path: inset(0 0 0 0); }
    }
    @media (max-width: 599px) {
      .caja { top: auto; bottom: 16px; right: 16px; }
    }
  `,
})
export class Aviso {
  protected readonly catalogo = inject(CatalogoService);
  private readonly pedido = inject(PedidoService);

  protected readonly visible = signal(false);
  protected readonly actual = computed(() => this.pedido.aviso()?.producto ?? null);

  constructor() {
    effect((onCleanup) => {
      if (!this.pedido.aviso()) return;
      this.visible.set(true);
      const t = setTimeout(() => this.visible.set(false), 4200);
      onCleanup(() => clearTimeout(t));
    });
  }
}
