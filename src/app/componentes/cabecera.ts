import { ChangeDetectionStrategy, Component, ElementRef, inject, signal, viewChild } from '@angular/core';
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
  private readonly router = inject(Router);
  /** Lo que se está buscando en la tienda, leído de la URL para que el buscador abra con ello. */
  protected readonly busqueda = signal('');
  private readonly buscador = viewChild.required<ElementRef<HTMLDialogElement>>('buscador');

  protected readonly enlaces = [
    { texto: 'Inicio', ruta: '/', exacto: true },
    { texto: 'Tienda', ruta: '/tienda', exacto: true },
    { texto: 'Grosores', ruta: '/', fragmento: 'grosores' },
    { texto: 'Carta de colores', ruta: '/', fragmento: 'carta' },
    { texto: 'Cómo pedir', ruta: '/', fragmento: 'como-pedir' },
  ];

  constructor() {
    this.router.events
      .pipe(
        filter((e) => e instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(() => {
        this.abierto.set(false);
        this.busqueda.set(this.enTienda() ? (this.router.parseUrl(this.router.url).queryParams['q'] ?? '') : '');
      });
  }

  protected abrirBuscador(): void {
    this.abierto.set(false);
    const dialogo = this.buscador().nativeElement;
    dialogo.showModal();
    dialogo.querySelector('input')?.select();
  }

  /** Un clic en el fondo (fuera de la caja) cierra el buscador. No devuelve nada: un `false` cancelaría el envío. */
  protected cerrarAlTocarFuera(evento: MouseEvent): void {
    const dialogo = this.buscador().nativeElement;
    if (evento.target === dialogo) dialogo.close();
  }

  /** Lleva a la tienda con la búsqueda puesta; la tienda filtra igual que con su propia caja. */
  protected buscar(valor: string): void {
    this.buscador().nativeElement.close();
    this.router.navigate(['/tienda'], { queryParams: { q: valor.trim() || null } });
  }

  private enTienda(): boolean {
    return this.router.url.split(/[?#]/)[0] === '/tienda';
  }
}
