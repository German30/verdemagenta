---
name: Verdemagenta
description: Trapillo por color y por grosor; el pedido termina en WhatsApp.
colors:
  ciruela-tinta: "#2e1838"
  ciruela: "#4a2a5c"
  ciruela-noche: "#211029"
  ciruela-bruma: "#b9a3c6"
  menta: "#138a64"
  menta-viva: "#2bb383"
  menta-clara: "#c8f0dd"
  menta-velo: "#e2f7ec"
  magenta: "#d6247a"
  magenta-hondo: "#c2186c"
  magenta-claro: "#f39bc4"
  magenta-velo: "#fbe3ee"
  suelo: "#f4f7f5"
  suelo-hondo: "#e7eeea"
  carton: "#ffffff"
  tinta: "#24132d"
  tinta-media: "#5b4b64"
  tinta-suave: "#736679"
  linea: "#ddd6e1"
typography:
  rotulo:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "clamp(3rem, 7vw, 5.75rem)"
    fontWeight: 800
    lineHeight: 0.98
    letterSpacing: "-0.02em"
  rotulo-seccion:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "clamp(2.25rem, 5vw, 3.75rem)"
    fontWeight: 800
    lineHeight: 0.98
  cuerpo:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.55
  grosor:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 700
    lineHeight: 1
rounded:
  base: "6px"
  pastilla: "99px"
spacing:
  gutter: "clamp(16px, 4vw, 48px)"
  seccion: "clamp(64px, 9vw, 112px)"
  ancho: "1240px"
components:
  button-primary:
    backgroundColor: "{colors.ciruela}"
    textColor: "#ffffff"
    rounded: "{rounded.base}"
    height: "46px"
  button-pedido:
    backgroundColor: "{colors.magenta}"
    textColor: "#ffffff"
    rounded: "{rounded.base}"
    height: "46px"
  button-linea:
    backgroundColor: "{colors.carton}"
    textColor: "{colors.ciruela}"
    rounded: "{rounded.base}"
    height: "46px"
  grosor:
    backgroundColor: "{colors.menta-velo}"
    textColor: "{colors.menta}"
    rounded: "{rounded.pastilla}"
  paso:
    backgroundColor: "{colors.magenta}"
    textColor: "#ffffff"
    rounded: "{rounded.base}"
    height: "44px"
  tarjeta:
    backgroundColor: "{colors.carton}"
    textColor: "{colors.tinta}"
    rounded: "{rounded.base}"
---

# Design System: Verdemagenta

## Overview

**El muestrario de color.** El catálogo es una carta de colores: el mismo rollo de trapillo en decenas de tonos y cinco grosores. La portada abre un abanico de fichas de color reales; cada producto es una tarjeta blanca donde el rollo (SVG, con el largo del ancho real de la tira) descansa sobre un velo de su propio color. Todo termina en un mensaje de WhatsApp ya escrito.

Este sistema reemplaza a una primera versión (verde botella, magenta rojizo, cordel dorado y etiquetas colgantes) que se leía navideña. **Regla de origen:** nada de verde oscuro junto a rojo, ni dorados, ni etiquetas de regalo.

## Colors

Estrategia **contenida con un campo**: fondo menta claro en la portada y en los encabezados, superficie casi blanca y ciruela oscuro solo en el pie y en "cómo pedir".

- **Ciruela** (`ciruela`, `ciruela-tinta`): titulares, botón principal y campos oscuros.
- **Menta** (`menta-velo`, `menta`): campos claros con retícula de puntos y pastillas de grosor. La menta oscura (`menta`) es solo para texto en pastillas.
- **Magenta**: exclusivo para lo elegido y para pedir (cantidades, enviar, contador, variante actual y filtros activos).
- **Muestras de producto**: vienen de `server/colores.mjs` y solo pintan rollos, fichas, lomos y tiras.

**La regla del magenta reservado.** Un botón que solo navega nunca es magenta.

## Typography

**Archivo** variable, una familia. Rótulos a `wdth 88`, peso 800, caja normal y tracking −0.02em. Cuerpo a `wdth 100`. Los lomos de la carta usan `wdth 62` en mayúsculas porque el texto va vertical en 30px. Cifras tabulares en precios y cantidades (`.cifra`).

## Layout

Contenedor de 1240px; secciones separadas por `clamp(64px, 9vw, 112px)`. La densidad alterna: portada con abanico, grosores a escala, rejilla de tarjetas, carta de lomos densa sobre blanco, "cómo pedir" en ciruela y accesorios. La tienda tiene filtros laterales de 264px, que en menos de 960px pasan a una hoja `<dialog>`.

## Elevation & Depth

- `sombra-tarjeta`: tarjetas en reposo. `sombra-alzada`: al pasar el puntero (con −3px). `sombra-panel`: panel de envío, avisos y vitrina. Las sombras siempre con matiz ciruela, nunca negras.

## Shapes

Esquinas de 6px; las pastillas de grosor son totalmente redondas y llevan una rayita que representa la tira; las fichas del abanico, de 8px.

## Components

- **Tarjeta de muestrario** (`app-etiqueta`): velo del color con el rollo, nombre, pastilla de grosor, acabado y precio, y luego "Agregar" o el paso magenta. Al agregar, el rollo da un brinco de 0.7s.
- **Abanico**: 10 fichas que giran de −42° a 42° sobre un remache y se abren al cargar; al pasar el puntero, la ficha sale 22px sobre su propio eje.
- **Rollo**: SVG con 17 patrones de acabado; los accesorios se dibujan como aro.
- **Lomos**: tiras verticales con el nombre; al pasar el puntero suben y muestran sus grosores y el precio desde.
- **Pastilla de grosor** (`.sello`): fondo menta claro con texto menta oscuro; en magenta cuando está seleccionada.

## Do's and Don'ts

### Do:
- **Do** mostrar el color antes que el texto.
- **Do** cerrar cada camino en el pedido o en WhatsApp.
- **Do** respetar `prefers-reduced-motion`.

### Don't:
- **Don't** juntar verde oscuro con rojo, ni usar dorado, cordeles o etiquetas colgantes: se lee navideño.
- **Don't** usar magenta en botones que solo navegan.
- **Don't** inventar existencias, envíos, reseñas o "más vendidos".
