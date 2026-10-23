import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { App } from './app';
import { erroresCliente, mensajePedido } from './util/formato';
import { Producto } from './modelos';
import { PedidoService } from './servicios/pedido';

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
    bajoPedido: false,
    color: 'Azul Rey',
    familia: 'azules',
    acabado: 'Liso',
    muestra: { base: '#2340A0', patron: 'liso', acentos: [] },
    foto: null,
    colorFoto: null,
    lomo: null,
  };

  it('lista cantidades, subtotales y total', () => {
    const texto = mensajePedido([{ producto: rollo, cantidad: 3 }], { nombre: 'Ana', correo: 'ana@correo.com', entrega: '', notas: '' });
    expect(texto).toContain('3 × Trapillo Gold 3 cm – Azul Rey');
    expect(texto).toContain('*Total: $480 MXN* (3 piezas)');
    expect(texto).toContain('Nombre: Ana');
    expect(texto).toContain('Correo: ana@correo.com');
    expect(texto).not.toContain('Dirección de entrega');
    expect(texto).not.toContain('bajo pedido');
  });

  it('marca los grosores bajo pedido y lo avisa al final', () => {
    const jumbo: Producto = { ...rollo, id: 2, nombre: 'Rollo Trapillo Gold Jumbo 20 cm – Mostaza', grosor: 'jumbo-20', bajoPedido: true, precio: 800 };
    const texto = mensajePedido(
      [{ producto: rollo, cantidad: 1 }, { producto: jumbo, cantidad: 1 }],
      { nombre: '', correo: '', entrega: '', notas: '' },
    );
    expect(texto).toContain('Jumbo 20 cm – Mostaza ($800 c/u) = $800 — bajo pedido');
    expect(texto).not.toContain('Azul Rey ($160 c/u) = $160 — bajo pedido');
    expect(texto).toContain('*bajo pedido* no está en inventario');
  });
});

describe('PedidoService', () => {
  afterEach(() => localStorage.clear());

  it('limita a 99 las cantidades que vienen alteradas del navegador', () => {
    localStorage.setItem('verdemagenta.pedido', JSON.stringify([{ id: 1, cantidad: 5000 }, { id: 2, cantidad: -3 }, { id: 'x', cantidad: 1 }]));
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    const servicio = TestBed.inject(PedidoService);
    expect(servicio.cantidad(1)).toBe(99);
    expect(servicio.cantidad(2)).toBe(0);
  });
});

describe('erroresCliente', () => {
  const completo = { nombre: 'Ana', correo: 'ana@correo.com', entrega: 'Av. Juárez 10, Centro, Guadalajara, 44100', notas: '' };

  it('acepta un cliente con nombre, correo y dirección', () => {
    expect(erroresCliente(completo)).toEqual({});
  });

  it('exige nombre, correo y dirección', () => {
    expect(Object.keys(erroresCliente({ nombre: ' ', correo: '', entrega: '', notas: 'algo' }))).toEqual(['nombre', 'correo', 'entrega']);
  });

  it('rechaza un correo mal escrito', () => {
    expect(erroresCliente({ ...completo, correo: 'ana@correo' }).correo).toContain('Revisa tu correo');
  });
});
