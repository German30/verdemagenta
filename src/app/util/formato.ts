import { Pipe, PipeTransform } from '@angular/core';
import { LineaPedido, Producto } from '../modelos';
import { TIENDA } from '../tienda.config';

const MXN = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

export function precio(valor: number): string {
  return MXN.format(valor);
}

@Pipe({ name: 'precio' })
export class PrecioPipe implements PipeTransform {
  transform(valor: number | null | undefined): string {
    return valor == null ? '' : precio(valor);
  }
}

/** Nombre corto para mensajes: "Trapillo Gold 3 cm – Azul Rey". */
export function nombreCorto(p: Producto): string {
  return p.nombre.replace(/^Rollo\s+/i, '');
}

export interface DatosCliente {
  nombre: string;
  entrega: string;
  notas: string;
}

export function mensajePedido(lineas: LineaPedido[], cliente: DatosCliente): string {
  const piezas = lineas.reduce((s, l) => s + l.cantidad, 0);
  const total = lineas.reduce((s, l) => s + l.cantidad * l.producto.precio, 0);
  const renglones = lineas.map(
    (l) =>
      `• ${l.cantidad} × ${nombreCorto(l.producto)} (${precio(l.producto.precio)} c/u) = ${precio(l.cantidad * l.producto.precio)}`,
  );
  const extra = [
    cliente.nombre.trim() && `Nombre: ${cliente.nombre.trim()}`,
    cliente.entrega.trim() && `Entrega en: ${cliente.entrega.trim()}`,
    cliente.notas.trim() && `Notas: ${cliente.notas.trim()}`,
  ].filter(Boolean);

  return [
    `¡Hola ${TIENDA.nombre}! Quiero hacer este pedido:`,
    '',
    ...renglones,
    '',
    `*Total: ${precio(total)} ${TIENDA.moneda}* (${piezas} ${piezas === 1 ? 'pieza' : 'piezas'})`,
    ...(extra.length ? ['', ...extra] : []),
  ].join('\n');
}

/** Texto tal como lo pinta WhatsApp: sin los asteriscos de negritas. */
export function vistaWhatsApp(texto: string): string {
  return texto.replace(/\*(.+?)\*/g, '$1');
}

export function mensajeConsulta(p: Producto): string {
  return `¡Hola ${TIENDA.nombre}! Me interesa: ${nombreCorto(p)} (${precio(p.precio)}). ¿Lo tienen disponible?`;
}

export function enlaceWhatsApp(texto: string): string {
  const numero = TIENDA.whatsapp.replace(/\D/g, '');
  return `https://wa.me/${numero}?text=${encodeURIComponent(texto)}`;
}
