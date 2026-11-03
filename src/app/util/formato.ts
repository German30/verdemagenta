import { Pipe, PipeTransform } from '@angular/core';
import { LineaPedido, Producto } from '../modelos';
import { TIENDA } from '../tienda.config';

const MXN = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 });
// Con centavos siempre dos cifras: $127.50, no $127.5
const MXN_CENTAVOS = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', minimumFractionDigits: 2 });

export function precio(valor: number): string {
  return (Number.isInteger(valor) ? MXN : MXN_CENTAVOS).format(valor);
}

@Pipe({ name: 'precio' })
export class PrecioPipe implements PipeTransform {
  transform(valor: number | null | undefined): string {
    return valor == null ? '' : precio(valor);
  }
}

/** Mayoreo: 15% en cada rollo de trapillo cuando el pedido junta 25 o más piezas de trapillo. */
export const MAYOREO = { piezas: 25, descuento: 0.15 };

/** Precio por pieza a mayoreo, redondeado a centavos ($150 → $127.50). */
export function precioMayoreo(valor: number): number {
  return Math.round(valor * (1 - MAYOREO.descuento) * 100) / 100;
}

export interface Cuenta {
  piezas: number;
  piezasTrapillo: number;
  mayoreo: boolean;
  /** Piezas de trapillo que faltan para el mayoreo (0 si ya aplica). */
  faltan: number;
  subtotal: number;
  ahorro: number;
  total: number;
}

/** Precio por pieza de una línea: los accesorios nunca llevan descuento. */
export function unitario(l: LineaPedido, mayoreo: boolean): number {
  return mayoreo && l.producto.tipo === 'trapillo' ? precioMayoreo(l.producto.precio) : l.producto.precio;
}

export function cuentaPedido(lineas: LineaPedido[]): Cuenta {
  const piezas = lineas.reduce((s, l) => s + l.cantidad, 0);
  const piezasTrapillo = lineas.reduce((s, l) => s + (l.producto.tipo === 'trapillo' ? l.cantidad : 0), 0);
  const mayoreo = piezasTrapillo >= MAYOREO.piezas;
  const subtotal = lineas.reduce((s, l) => s + l.cantidad * l.producto.precio, 0);
  const total = Math.round(lineas.reduce((s, l) => s + l.cantidad * unitario(l, mayoreo), 0) * 100) / 100;
  return {
    piezas,
    piezasTrapillo,
    mayoreo,
    faltan: mayoreo ? 0 : MAYOREO.piezas - piezasTrapillo,
    subtotal,
    ahorro: Math.round((subtotal - total) * 100) / 100,
    total,
  };
}

/** Nombre corto para mensajes: "Trapillo Gold 3 cm – Azul Rey". */
export function nombreCorto(p: Producto): string {
  return p.nombre.replace(/^Rollo\s+/i, '');
}

export interface DatosCliente {
  nombre: string;
  correo: string;
  /** Dirección de entrega completa. */
  entrega: string;
  notas: string;
}

export type ErroresCliente = Partial<Record<'nombre' | 'correo' | 'entrega', string>>;

const CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Nombre, correo y dirección son obligatorios para enviar el pedido. */
export function erroresCliente(c: DatosCliente): ErroresCliente {
  const errores: ErroresCliente = {};
  if (!c.nombre.trim()) errores.nombre = 'Escribe tu nombre.';
  if (!c.correo.trim()) errores.correo = 'Escribe tu correo electrónico.';
  else if (!CORREO.test(c.correo.trim())) errores.correo = 'Revisa tu correo, por ejemplo: nombre@gmail.com';
  if (!c.entrega.trim()) errores.entrega = 'Escribe la dirección de entrega.';
  return errores;
}

export function mensajePedido(lineas: LineaPedido[], cliente: DatosCliente): string {
  const { piezas, mayoreo, subtotal, ahorro, total } = cuentaPedido(lineas);
  const renglones = lineas.map((l) => {
    const pieza = unitario(l, mayoreo);
    return (
      `• ${l.cantidad} × ${nombreCorto(l.producto)} (${precio(pieza)} c/u) = ${precio(l.cantidad * pieza)}` +
      (l.producto.bajoPedido ? ' — bajo pedido' : '')
    );
  });
  const descuento = mayoreo
    ? [
        '',
        `Subtotal: ${precio(subtotal)}`,
        `Descuento mayoreo ${MAYOREO.descuento * 100}% (${MAYOREO.piezas} o más piezas de trapillo): −${precio(ahorro)}`,
      ]
    : [];
  const aviso = lineas.some((l) => l.producto.bajoPedido)
    ? ['', 'Entiendo que lo marcado *bajo pedido* no está en inventario y se pide al confirmar.']
    : [];
  const extra = [
    cliente.nombre.trim() && `Nombre: ${cliente.nombre.trim()}`,
    cliente.correo.trim() && `Correo: ${cliente.correo.trim()}`,
    cliente.entrega.trim() && `Dirección de entrega: ${cliente.entrega.trim()}`,
    cliente.notas.trim() && `Notas: ${cliente.notas.trim()}`,
  ].filter(Boolean);

  return [
    `¡Hola ${TIENDA.nombre}! Quiero hacer este pedido:`,
    '',
    ...renglones,
    ...descuento,
    ...(mayoreo ? [] : ['']),
    `*Total: ${precio(total)} ${TIENDA.moneda}* (${piezas} ${piezas === 1 ? 'pieza' : 'piezas'})`,
    ...aviso,
    ...(extra.length ? ['', ...extra] : []),
  ].join('\n');
}

/** Texto tal como lo pinta WhatsApp: sin los asteriscos de negritas. */
export function vistaWhatsApp(texto: string): string {
  return texto.replace(/\*(.+?)\*/g, '$1');
}

export function mensajeConsulta(p: Producto): string {
  return p.bajoPedido
    ? `¡Hola ${TIENDA.nombre}! Me interesa: ${nombreCorto(p)} (${precio(p.precio)}), que es bajo pedido. ¿En cuánto tiempo me llegaría?`
    : `¡Hola ${TIENDA.nombre}! Me interesa: ${nombreCorto(p)} (${precio(p.precio)}). ¿Lo tienen disponible?`;
}

export function enlaceWhatsApp(texto: string): string {
  const numero = TIENDA.whatsapp.replace(/\D/g, '');
  return `https://wa.me/${numero}?text=${encodeURIComponent(texto)}`;
}
