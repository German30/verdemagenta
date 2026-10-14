import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Etiqueta } from '../../componentes/etiqueta';
import { Icono } from '../../componentes/icono';
import { Producto } from '../../modelos';
import { CatalogoService } from '../../servicios/catalogo';
import { fondoMuestra, tintaSobre } from '../../util/color';
import { mensajePedido, precio, PrecioPipe, vistaWhatsApp } from '../../util/formato';
import { Revelar } from '../../util/revelar';

// Colores que representan a cada grosor en la sección "a escala", por orden de preferencia.
const REPRESENTANTES: Record<string, string[]> = {
  '2-5': ['Magenta', 'Rosa Fucsia'],
  '3': ['Verde Tropical', 'Azul Turquesa'],
  '4-5': ['Azul Turquesa', 'Amarillo'],
  '6': ['Naranja', 'Mostaza'],
  'jumbo-20': ['Rosa Palo', 'Mostaza'],
};

// Colores del abanico de portada, en orden.
const ABANICO = [
  'Rosa Barbie',
  'Coral',
  'Durazno',
  'Amarillo',
  'Verde Pistache',
  'Menta Baby',
  'Azul Turquesa',
  'Azul Cielo',
  'Lila',
  'Violeta',
];

@Component({
  selector: 'app-inicio',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Etiqueta, Icono, PrecioPipe, Revelar],
  templateUrl: './inicio.html',
  styleUrl: './inicio.scss',
})
export class Inicio {
  protected readonly catalogo = inject(CatalogoService);

  protected readonly totalColores = computed(() => this.catalogo.colores().length);
  protected readonly desde = computed(() => {
    const precios = this.catalogo.trapillos().map((p) => p.precio);
    return precios.length ? Math.min(...precios) : 0;
  });

  /** Abanico de portada: tonos vivos del catálogo, sin pares rojo-verde oscuro. */
  protected readonly abanico = computed(() => {
    const trapillos = this.catalogo.trapillos();
    const elegidos = ABANICO.map(
      (c) => trapillos.find((p) => p.color === c && p.grosor === '3') ?? trapillos.find((p) => p.color === c),
    ).filter((p): p is Producto => !!p);
    return elegidos.map((producto, i) => ({
      producto,
      giro: elegidos.length > 1 ? -42 + (84 * i) / (elegidos.length - 1) : 0,
      fondo: fondoMuestra(producto.muestra),
    }));
  });
  protected readonly abanicoVacio = Array.from({ length: 10 }, (_, i) => -42 + (84 * i) / 9);

  protected readonly grosores = computed(() =>
    this.catalogo.grosores().map((g) => {
      const productos = this.catalogo.trapillos().filter((p) => p.grosor === g.id);
      const preferidos = REPRESENTANTES[g.id] ?? [];
      const muestra =
        preferidos.map((c) => productos.find((p) => p.color === c)).find(Boolean) ?? productos[0];
      return {
        ...g,
        colores: productos.length,
        desde: productos.length ? Math.min(...productos.map((p) => p.precio)) : 0,
        fondo: muestra ? fondoMuestra(muestra.muestra) : 'var(--menta-500)',
      };
    }),
  );

  /** Acabados especiales: metálicos, polipiel, neón y estampados, uno por color. */
  protected readonly especiales = computed(() => {
    const vistos = new Set<string>();
    const orden = ['Metálico', 'Polipiel', 'Estampado', 'Neón', 'Texturizado'];
    const lista: Producto[] = [];
    for (const acabado of orden) {
      for (const p of this.catalogo.trapillos()) {
        if (p.acabado !== acabado || vistos.has(p.color!)) continue;
        if (lista.filter((x) => x.acabado === acabado).length >= 2) break;
        vistos.add(p.color!);
        lista.push(p);
      }
    }
    return lista.slice(0, 10);
  });

  /** Carta completa agrupada por familia; cada lomo resume en qué grosores existe. */
  protected readonly carta = computed(() => {
    const trapillos = this.catalogo.trapillos();
    return this.catalogo.familias().map((f) => ({
      familia: f,
      colores: this.catalogo
        .colores()
        .filter((c) => c.familia === f.id)
        .map((c) => {
          const variantes = trapillos.filter((p) => p.color === c.color);
          const grosores = this.catalogo.grosores().filter((g) => variantes.some((v) => v.grosor === g.id));
          return {
            color: c.color!,
            fondo: fondoMuestra(c.muestra),
            tinta: tintaSobre(c.muestra.base),
            grosores: grosores.map((g) => g.nombre).join(' · '),
            desde: precio(Math.min(...variantes.map((v) => v.precio))),
          };
        }),
    }));
  });

  /** Mensaje de ejemplo construido con productos reales del catálogo. */
  protected readonly ejemplo = computed(() => {
    const t = this.catalogo.trapillos();
    const tomar = (color: string, grosor: string) => t.find((p) => p.color === color && p.grosor === grosor);
    const lineas = [
      { producto: tomar('Verde Botella', '3'), cantidad: 2 },
      { producto: tomar('Magenta', '3'), cantidad: 2 },
      { producto: tomar('Ivory', '3'), cantidad: 1 },
    ].filter((l): l is { producto: Producto; cantidad: number } => !!l.producto);
    return lineas.length
      ? vistaWhatsApp(mensajePedido(lineas, { nombre: 'Ana', entrega: 'Guadalajara, Jal.', notas: '' }))
      : '';
  });

  protected readonly ejemploLineas = computed(() => this.ejemplo().split('\n'));

}
