# Product

<!-- impeccable:product-schema 1 -->

> Inferido del brief ("canal de ventas dirigido a WhatsApp", UI de referencia trapillopillo.com, BD `inventario_vm`) sin ronda de entrevista: el usuario pidió avanzar sin preguntas. Los puntos marcados *(inferido)* deben confirmarse.

## Platform

web

## Stack

Angular 21 (standalone, signals, SCSS) para el sitio. API Node + Express + mysql2 en `/server` que lee `inventario_vm` en solo lectura. *(delegado: Angular no puede consultar MySQL directamente; Express es la capa más ligera dentro del mismo repo.)*

## Users

Personas que tejen con trapillo (artesanas, aficionadas, pequeños talleres que hacen bolsos, tapetes, cestos y cojines) en México *(inferido por precios en MXN y la referencia)*. Llegan con un proyecto en mente y buscan **el color exacto y el grosor correcto**, a menudo varios colores para combinar. Navegan sobre todo desde el celular *(inferido: canal WhatsApp)*.

## Product Purpose

Verdemagenta vende rollos de trapillo y accesorios. El sitio es un **catálogo con carrito que termina en WhatsApp**: el cliente arma su pedido y el sitio genera un mensaje con productos, cantidades y total para enviarlo al número de la tienda. No hay pago en línea, cuentas ni wishlist. Éxito = pedidos claros que llegan a WhatsApp listos para confirmar.

## Positioning

El inventario es, en esencia, una carta de colores: el mismo rollo en decenas de tonos y cinco grosores. El sitio deja elegir y combinar por color y grosor mejor que una tienda WooCommerce genérica, y cierra la venta en una conversación humana.

## Operating Context

- Un solo origen de datos: tabla `producto` (id, producto, precio, descripcion, categoria). 157+ registros.
- Categorías reales: TRAPILLO 2.5 CMS, TRAPILLO 3 CMS, TRAPILLO 4.5 CMS, TRAPILLO 6 CMS, TRAPILLO JUMBO 20 CMS, ACCESORIOS.
- El color está solo en el nombre ("Rollo Trapillo Gold 2.5 cm – Azul Petróleo"); acabados especiales: Metálico, Polipiel, Mate.
- Sin imágenes, sin stock, sin SKU en la BD.

## Capabilities and Constraints

- Catálogo con filtros por grosor (categoría), familia de color, acabado y precio; búsqueda; orden.
- Ficha de producto, carrito persistente en el navegador, envío del pedido por `wa.me`.
- **Pendiente:** número de WhatsApp de la tienda, datos de contacto, redes, logotipo, fotos reales, política de envíos.

## Brand Commitments

Nombre: **Verdemagenta**. El nombre fija dos colores de marca: verde y magenta *(inferido del nombre)*.

## Evidence on Hand

- Catálogo y precios reales en `inventario_vm.producto`.
- Análisis de referencia: `Documents/Analisis-UI-TrapilloPillo.docx`.
- No hay testimonios, fotos de producto, cifras de ventas ni tiempos de entrega: no inventarlos.

## Product Principles

1. El color es el producto: verlo antes que leerlo.
2. De la idea al pedido en WhatsApp en el menor número de toques posible, sobre todo en móvil.
3. Precios y nombres salen de la BD, nunca hardcodeados.
4. Honestidad: nada de existencias, envíos o reseñas que no existan.
