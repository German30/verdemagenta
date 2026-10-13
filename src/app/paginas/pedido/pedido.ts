import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Icono } from '../../componentes/icono';
import { Foto } from '../../componentes/foto';
import { CatalogoService } from '../../servicios/catalogo';
import { PedidoService } from '../../servicios/pedido';
import { TIENDA } from '../../tienda.config';
import { DatosCliente, enlaceWhatsApp, mensajePedido, PrecioPipe, vistaWhatsApp } from '../../util/formato';

const CLAVE_CLIENTE = 'verdemagenta.cliente';

function leerCliente(): DatosCliente {
  try {
    const c = JSON.parse(localStorage.getItem(CLAVE_CLIENTE) ?? '{}');
    return { nombre: c.nombre ?? '', entrega: c.entrega ?? '', notas: '' };
  } catch {
    return { nombre: '', entrega: '', notas: '' };
  }
}

@Component({
  selector: 'app-pedido',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Foto, Icono, PrecioPipe],
  templateUrl: './pedido.html',
  styleUrl: './pedido.scss',
})
export class Pedido {
  protected readonly catalogo = inject(CatalogoService);
  protected readonly pedido = inject(PedidoService);

  protected readonly cliente = signal<DatosCliente>(leerCliente());
  protected readonly enviado = signal(false);
  protected readonly sinNumero = !TIENDA.whatsapp;

  protected readonly mensaje = computed(() => mensajePedido(this.pedido.lineas(), this.cliente()));
  protected readonly vista = computed(() => vistaWhatsApp(this.mensaje()));
  protected readonly enlace = computed(() => enlaceWhatsApp(this.mensaje()));

  constructor() {
    effect(() => {
      const { nombre, entrega } = this.cliente();
      try {
        localStorage.setItem(CLAVE_CLIENTE, JSON.stringify({ nombre, entrega }));
      } catch {
        // sin almacenamiento, no pasa nada
      }
    });
  }

  protected campo(clave: keyof DatosCliente, evento: Event): void {
    const valor = (evento.target as HTMLInputElement).value;
    this.cliente.update((c) => ({ ...c, [clave]: valor }));
  }

  protected grosor(id: string | null): string {
    return this.catalogo.grosor(id)?.nombre ?? 'Accesorio';
  }

  protected vaciar(): void {
    this.pedido.vaciar();
    this.enviado.set(false);
  }
}
