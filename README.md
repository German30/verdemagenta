# verdemagenta
Desarrollo de web para verdemagenta

Catálogo de trapillo con carrito que envía el pedido por WhatsApp. Angular 21 en el frente y una API Express de solo lectura sobre la base MySQL `inventario_vm`.

## Requisitos

- Node 22.12 o superior
- MySQL con la base `inventario_vm` (tabla `producto`)

## Configuración

1. Copia `.env.example` a `.env` y pon tus credenciales de MySQL.
2. Pon el número de WhatsApp de la tienda en [src/app/tienda.config.ts](src/app/tienda.config.ts) (formato internacional sin signos, p. ej. `5215512345678`). Ahí también van correo y redes; lo que quede vacío no se muestra.

## Fotos de producto

Los originales van en `src/app/resources/` (no se suben a git), nombrados igual que el producto en la BD, p. ej. `Rollo Trapillo Gold 3 cm – Azul Rey.jpg`. Luego:

```bash
npm run fotos   # genera public/fotos/<id>-480.webp, <id>-960.webp y fotos.json
```

El script avisa qué fotos no encontraron producto y qué productos quedaron sin foto; esos se muestran con el rollo dibujado.

## Desarrollo

```bash
npm start       # API (puerto 3000) + sitio en http://localhost:4200
```

`ng serve` solo levanta Angular y el catálogo no carga. Si prefieres terminales separadas: `npm run api` y `npm run web`.

## Producción

```bash
npm run serve:prod   # compila Angular y sirve sitio + API en el puerto 3000
```

## Estructura

- `server/index.mjs`: API (`GET /api/catalogo`, `GET /api/productos/:id`), con caché de 60 s.
- `server/catalogo.mjs`: separa grosor, color y línea a partir del nombre del producto.
- `server/colores.mjs`: carta de colores. Asigna a cada nombre una muestra (hex, familia y acabado). Si agregas un color nuevo a la BD, regístralo aquí; si no, aparece en gris neutro.
- `src/app/paginas`: inicio, tienda (filtros en la URL), ficha de producto y pedido.
- `src/app/componentes`: etiqueta colgante, rollo SVG, cabecera, pie y aviso.
- `PRODUCT.md` y `DESIGN.md`: contexto de producto y sistema visual.

## Tests

```bash
npm test
```
