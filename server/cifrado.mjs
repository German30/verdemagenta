// Cifrado de las consultas a la API, encima de HTTPS: el navegador y el servidor acuerdan una
// clave con ECDH P-256, la estiran con HKDF-SHA256 y cifran pedido y respuesta con AES-256-GCM.
// En la pestaña Network solo se ve { kid, k, iv, c } de ida y { iv, c } de vuelta.
//
// El par de claves del servidor vive en memoria y cambia en cada arranque: el navegador pide la
// pública en /api/clave y, si el servidor se reinició, recibe 409 y vuelve a pedirla.
import { createCipheriv, createDecipheriv, createHash, createPublicKey, diffieHellman, generateKeyPairSync, hkdfSync, randomBytes } from 'node:crypto';

const INFO = Buffer.from('verdemagenta-api-v1');
const ETIQUETA = 16;

const par = generateKeyPairSync('ec', { namedCurve: 'P-256' });
const { kty, crv, x, y } = par.publicKey.export({ format: 'jwk' });

export const clavePublica = { kty, crv, x, y };
export const kid = createHash('sha256').update(`${x}.${y}`).digest('base64url').slice(0, 16);

/** Error que se responde al navegador sin cifrar (no hay clave compartida con qué hacerlo). */
export class ErrorSobre extends Error {
  constructor(estado, mensaje) {
    super(mensaje);
    this.estado = estado;
  }
}

function claveCompartida(jwk) {
  if (jwk?.kty !== 'EC' || jwk.crv !== 'P-256' || typeof jwk.x !== 'string' || typeof jwk.y !== 'string') {
    throw new ErrorSobre(400, 'Clave del navegador inválida.');
  }
  let publica;
  try {
    publica = createPublicKey({ key: { kty: 'EC', crv: 'P-256', x: jwk.x, y: jwk.y }, format: 'jwk' });
  } catch {
    throw new ErrorSobre(400, 'Clave del navegador inválida.');
  }
  const secreto = diffieHellman({ privateKey: par.privateKey, publicKey: publica });
  return Buffer.from(hkdfSync('sha256', secreto, Buffer.alloc(0), INFO, 32));
}

/** Abre el sobre del navegador: devuelve la consulta en claro y la clave para responder. */
export function abrir(sobre) {
  if (!sobre || typeof sobre !== 'object') throw new ErrorSobre(400, 'Consulta inválida.');
  if (sobre.kid !== kid) throw new ErrorSobre(409, 'La clave del servidor cambió.');
  if (typeof sobre.iv !== 'string' || typeof sobre.c !== 'string') throw new ErrorSobre(400, 'Consulta inválida.');

  const clave = claveCompartida(sobre.k);
  const iv = Buffer.from(sobre.iv, 'base64url');
  const datos = Buffer.from(sobre.c, 'base64url');
  if (iv.length !== 12 || datos.length <= ETIQUETA) throw new ErrorSobre(400, 'Consulta inválida.');

  try {
    // Web Crypto pega la etiqueta de autenticación al final del texto cifrado
    const descifrador = createDecipheriv('aes-256-gcm', clave, iv);
    descifrador.setAuthTag(datos.subarray(-ETIQUETA));
    const claro = Buffer.concat([descifrador.update(datos.subarray(0, -ETIQUETA)), descifrador.final()]);
    return { consulta: JSON.parse(claro.toString('utf8')), clave };
  } catch {
    throw new ErrorSobre(400, 'No se pudo descifrar la consulta.');
  }
}

/** Cierra la respuesta con la clave de esa consulta y un IV nuevo. */
export function cerrar(valor, clave) {
  const iv = randomBytes(12);
  const cifrador = createCipheriv('aes-256-gcm', clave, iv);
  const datos = Buffer.concat([cifrador.update(JSON.stringify(valor), 'utf8'), cifrador.final(), cifrador.getAuthTag()]);
  return { iv: iv.toString('base64url'), c: datos.toString('base64url') };
}
