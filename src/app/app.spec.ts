import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { App } from './app';
import { mensajePedido } from './util/formato';
import { Producto } from './modelos';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
  });

  it('crea la app con cabecera y pie', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('app-cabecera')).toBeTruthy();
    expect(el.querySelector('app-pie')).toBeTruthy();
  });
});

describe('mensajePedido', () => {
  const rollo: Producto = {
    id: 1,
    nombre: 'Rollo Trapillo Gold 3 cm – Azul Rey',
    titulo: 'Azul Rey',
    linea: 'Trapillo Gold',
    precio: 160,
    descripcion: '',
    categoria: 'TRAPILLO 3 CMS',
    tipo: 'trapillo',
    grosor: '3',
    color: 'Azul Rey',
    familia: 'azules',
    acabado: 'Liso',
    muestra: { base: '#2340A0', patron: 'liso', acentos: [] },
    foto: null,
  };

  it('lista cantidades, subtotales y total', () => {
    const texto = mensajePedido([{ producto: rollo, cantidad: 3 }], { nombre: 'Ana', entrega: '', notas: '' });
    expect(texto).toContain('3 × Trapillo Gold 3 cm – Azul Rey');
    expect(texto).toContain('*Total: $480 MXN* (3 piezas)');
    expect(texto).toContain('Nombre: Ana');
    expect(texto).not.toContain('Entrega en');
  });
});
