import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Icono } from '../../componentes/icono';
import { Foto } from '../../componentes/foto';
import { CatalogoService } from '../../servicios/catalogo';
import { PedidoService } from '../../servicios/pedido';
import { TIENDA } from '../../tienda.config';
import {
  DatosCliente,
  enlaceWhatsApp,
  ErroresCliente,
  erroresCliente,
  mensajePedido,
  PrecioPipe,
  vistaWhatsApp,
} from '../../util/formato';

const CLAVE_CLIENTE = 'verdemagenta.cliente';
type Obligatorio = keyof ErroresCliente;
const OBLIGATORIOS: Obligatorio[] = ['nombre', 'correo', 'entrega'];

function hayGuardado(): boolean {
  try {
    return localStorage.getItem(CLAVE_CLIENTE) !== null;
  } catch {
    return false;
  }
}

function leerCliente(): DatosCliente {
  try {
    const c = JSON.parse(localStorage.getItem(CLAVE_CLIENTE) ?? '{}');
    return { nombre: c.nombre ?? '', correo: c.correo ?? '', entrega: c.entrega ?? '', notas: '' };
  } catch {
    return { nombre: '', correo: '', entrega: '', notas: '' };
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
  // Los datos personales solo se guardan en el navegador si el cliente lo pide (apagado por defecto)
  protected readonly recordar = signal(hayGuardado());
  protected readonly enviado = signal(false);
  protected readonly sinNumero = !TIENDA.whatsapp;

  // Los errores se muestran al salir del campo o al intentar enviar, no mientras se escribe por primera vez
  private readonly tocados = signal<ReadonlySet<Obligatorio>>(new Set());
  private readonly errores = computed(() => erroresCliente(this.cliente()));
  protected readonly completo = computed(() => !Object.keys(this.errores()).length);

  protected readonly mensaje = computed(() => mensajePedido(this.pedido.lineas(), this.cliente()));
  protected readonly vista = computed(() => vistaWhatsApp(this.mensaje()));
  protected readonly enlace = computed(() => enlaceWhatsApp(this.mensaje()));

  constructor() {
    effect(() => {
      const { nombre, correo, entrega } = this.cliente();
      try {
        if (this.recordar()) localStorage.setItem(CLAVE_CLIENTE, JSON.stringify({ nombre, correo, entrega }));
        else localStorage.removeItem(CLAVE_CLIENTE);
      } catch {
        // sin almacenamiento, no pasa nada
      }
    });
  }

  protected campo(clave: keyof DatosCliente, evento: Event): void {
    const valor = (evento.target as HTMLInputElement).value;
    this.cliente.update((c) => ({ ...c, [clave]: valor }));
  }

  protected alternarRecordar(evento: Event): void {
    this.recordar.set((evento.target as HTMLInputElement).checked);
  }

  protected tocar(clave: Obligatorio): void {
    this.tocados.update((t) => new Set(t).add(clave));
  }

  protected error(clave: Obligatorio): string | null {
    return this.tocados().has(clave) ? (this.errores()[clave] ?? null) : null;
  }

  /** Sin los datos obligatorios no se abre WhatsApp: se muestran los errores y se va al primero. */
  protected enviar(evento: Event): void {
    if (!this.completo()) {
      evento.preventDefault();
      this.tocados.set(new Set(OBLIGATORIOS));
      const primero = OBLIGATORIOS.find((c) => this.errores()[c]);
      if (primero) document.getElementById(primero)?.focus();
      return;
    }
    this.enviado.set(true);
  }

  protected grosor(id: string | null): string {
    return this.catalogo.grosor(id)?.nombre ?? 'Accesorio';
  }

  protected vaciar(): void {
    this.pedido.vaciar();
    this.enviado.set(false);
  }
}
