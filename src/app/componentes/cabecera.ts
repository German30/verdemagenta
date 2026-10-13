import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PedidoService } from '../servicios/pedido';
import { PrecioPipe } from '../util/formato';
import { Icono } from './icono';
import { Marca } from './marca';

@Component({
  selector: 'app-cabecera',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, Icono, Marca, PrecioPipe],
  templateUrl: './cabecera.html',
  styleUrl: './cabecera.scss',
})
export class Cabecera {
  protected readonly pedido = inject(PedidoService);
  protected readonly abierto = signal(false);

  protected readonly enlaces = [
    { texto: 'Inicio', ruta: '/', exacto: true },
    { texto: 'Tienda', ruta: '/tienda', exacto: true },
    { texto: 'Grosores', ruta: '/', fragmento: 'grosores' },
    { texto: 'Carta de colores', ruta: '/', fragmento: 'carta' },
    { texto: 'Cómo pedir', ruta: '/', fragmento: 'como-pedir' },
  ];

  constructor() {
    inject(Router)
      .events.pipe(
        filter((e) => e instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(() => this.abierto.set(false));
  }
}
