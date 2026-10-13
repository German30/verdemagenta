import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Revelar } from './revelar';

@Component({
  imports: [Revelar],
  template: `<div appRevelar="0.3">contenido</div>`,
})
class Anfitrion {}

describe('Revelar', () => {
  let disparar: (visible: boolean) => void;

  beforeEach(() => {
    // Observador falso: el test decide cuándo entra en pantalla
    class ObservadorFalso {
      constructor(private cb: IntersectionObserverCallback) {
        disparar = (visible) =>
          this.cb([{ isIntersecting: visible } as IntersectionObserverEntry], this as unknown as IntersectionObserver);
      }
      observe() {}
      disconnect() {}
    }
    vi.stubGlobal('IntersectionObserver', ObservadorFalso);
    vi.stubGlobal('matchMedia', () => ({ matches: false }));
    vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('visible');
    // Debajo del pliegue al cargar
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({ top: 5000, bottom: 5200 } as DOMRect);
  });

  afterEach(() => vi.unstubAllGlobals());

  it('esconde lo que está fuera de pantalla y lo muestra al entrar, sin dejar por-revelar', async () => {
    const fixture = TestBed.createComponent(Anfitrion);
    await fixture.whenStable();
    const el: HTMLElement = fixture.nativeElement.querySelector('div');
    expect(el.classList).toContain('por-revelar');

    disparar(true);
    await fixture.whenStable();
    expect(el.classList).toContain('revelado');
    expect(el.classList).not.toContain('por-revelar');
  });

  it('no esconde nada si la pestaña está oculta', async () => {
    vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('hidden');
    const fixture = TestBed.createComponent(Anfitrion);
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('div').classList).not.toContain('por-revelar');
  });
});
