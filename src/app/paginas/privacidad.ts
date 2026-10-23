import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TIENDA } from '../tienda.config';

// Aviso de privacidad integral (LFPDPPP). Revisar con un asesor legal antes de publicar
// y actualizar la fecha cuando cambie.
@Component({
  selector: 'app-privacidad',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <header class="lienzo encabezado-pagina">
      <div class="contenedor">
        <ol class="migas">
          <li><a routerLink="/">Inicio</a></li>
          <li aria-current="page">Aviso de privacidad</li>
        </ol>
        <h1 class="rotulo">Aviso de privacidad</h1>
      </div>
    </header>

    <article class="contenedor texto">
      <p class="fecha">Última actualización: 23 de octubre de 2026</p>

      <h2 class="rotulo">Quién es responsable de tus datos</h2>
      <p>
        {{ tienda.nombre }} (Verdemagenta) es responsable del tratamiento de los datos personales que nos
        compartes en este sitio. Para cualquier asunto de privacidad escríbenos a
        <a [href]="'mailto:' + tienda.correo">{{ tienda.correo }}</a>.
      </p>

      <h2 class="rotulo">Qué datos recabamos</h2>
      <p>Solo los que escribes en el formulario de pedido: nombre, correo electrónico, dirección de entrega y las notas que agregues. No recabamos datos sensibles ni datos de pago en este sitio.</p>

      <h2 class="rotulo">Para qué los usamos</h2>
      <ul>
        <li>Confirmar tu pedido, acordar el pago y enviarlo a tu domicilio.</li>
        <li>Contactarte sobre ese pedido, por ejemplo cuando un grosor es bajo pedido.</li>
      </ul>
      <p>No los usamos para publicidad ni los vendemos o compartimos con terceros, salvo con la paquetería que entrega tu pedido y cuando una autoridad lo requiera conforme a la ley.</p>

      <h2 class="rotulo">Cómo nos llegan</h2>
      <p>
        Este sitio no guarda tus datos en ningún servidor: arma un mensaje que tú decides enviar por WhatsApp.
        Al enviarlo, el mensaje queda sujeto también a la política de privacidad de WhatsApp. Si marcas
        «Recordar mis datos», se guardan únicamente en tu navegador y puedes borrarlos desmarcando esa opción.
      </p>

      <h2 class="rotulo">Tus derechos ARCO</h2>
      <p>
        Puedes pedir acceso, rectificación, cancelación u oposición al uso de tus datos, o revocar tu
        consentimiento, escribiendo a <a [href]="'mailto:' + tienda.correo">{{ tienda.correo }}</a> con tu
        nombre y lo que solicitas. Te responderemos en un plazo máximo de 20 días hábiles.
      </p>

      <h2 class="rotulo">Cambios a este aviso</h2>
      <p>Cualquier cambio se publicará en esta misma página con su fecha de actualización.</p>
    </article>
  `,
  styles: `
    .texto { display: grid; gap: 14px; padding-top: 36px; }
    .texto > * { max-width: 68ch; }
    .fecha { color: var(--tinta-3); font-size: 0.875rem; }
    h2 { margin-top: 18px; font-size: 1.5rem; color: var(--ciruela-800); }
    p, li { color: var(--tinta-2); }
    ul { margin: 0; padding-left: 1.2em; display: grid; gap: 6px; }
    a { color: var(--ciruela-700); font-weight: 600; }
  `,
})
export class Privacidad {
  protected readonly tienda = TIENDA;
}
