import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';

/** Consultas que entiende POST /api/consulta. */
export type Consulta = { ruta: 'catalogo' } | { ruta: 'producto'; id: number };

interface ClaveServidor {
  kid: string;
  clave: JsonWebKey;
}

interface Sesion {
  kid: string;
  publica: JsonWebKey;
  aes: CryptoKey;
}

interface Sobre {
  iv: string;
  c: string;
}

const INFO = new TextEncoder().encode('verdemagenta-api-v1');
const ECDH: EcKeyImportParams = { name: 'ECDH', namedCurve: 'P-256' };

function aBase64(bytes: ArrayBuffer | Uint8Array): string {
  let binario = '';
  for (const b of new Uint8Array(bytes)) binario += String.fromCharCode(b);
  return btoa(binario).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function deBase64(texto: string): Uint8Array<ArrayBuffer> {
  const binario = atob(texto.replace(/-/g, '+').replace(/_/g, '/'));
  return Uint8Array.from(binario, (c) => c.charCodeAt(0));
}

/**
 * Habla con la API cifrando cada consulta y su respuesta (ver server/cifrado.mjs): acuerda una
 * clave con el servidor por ECDH P-256 + HKDF-SHA256 y usa AES-256-GCM.
 */
@Injectable({ providedIn: 'root' })
export class ApiCifrada {
  private readonly http = inject(HttpClient);
  private sesion: Promise<Sesion> | null = null;

  async consultar<T>(consulta: Consulta): Promise<T> {
    try {
      return await this.enviar<T>(consulta);
    } catch (err) {
      // El servidor se reinició y cambió su clave: se acuerda otra y se reintenta una vez
      if (err instanceof HttpErrorResponse && err.status === 409) {
        this.sesion = null;
        return this.enviar<T>(consulta);
      }
      throw err;
    }
  }

  private async enviar<T>(consulta: Consulta): Promise<T> {
    const { kid, publica, aes } = await (this.sesion ??= this.acordar().catch((err) => {
      this.sesion = null;
      throw err;
    }));

    const iv = crypto.getRandomValues(new Uint8Array(12));
    const claro = new TextEncoder().encode(JSON.stringify(consulta));
    const cifrado = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, aes, claro);

    const sobre = await firstValueFrom(
      this.http.post<Sobre>('/api/consulta', { kid, k: publica, iv: aBase64(iv), c: aBase64(cifrado) }),
    );
    const abierto = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: deBase64(sobre.iv) }, aes, deBase64(sobre.c));
    const { estado, cuerpo } = JSON.parse(new TextDecoder().decode(abierto)) as { estado: number; cuerpo: unknown };

    if (estado >= 400) throw new HttpErrorResponse({ status: estado, error: cuerpo, url: '/api/consulta' });
    return cuerpo as T;
  }

  /** Pide la clave pública del servidor y deriva la clave AES de esta pestaña. */
  private async acordar(): Promise<Sesion> {
    const servidor = await firstValueFrom(this.http.get<ClaveServidor>('/api/clave'));
    const suya = await crypto.subtle.importKey('jwk', servidor.clave, ECDH, false, []);

    // La privada no se puede exportar: solo sirve para derivar dentro del navegador
    const propio = await crypto.subtle.generateKey(ECDH, false, ['deriveBits']);
    const { kty, crv, x, y } = await crypto.subtle.exportKey('jwk', propio.publicKey);

    const secreto = await crypto.subtle.deriveBits({ name: 'ECDH', public: suya }, propio.privateKey, 256);
    const base = await crypto.subtle.importKey('raw', secreto, 'HKDF', false, ['deriveKey']);
    const aes = await crypto.subtle.deriveKey(
      { name: 'HKDF', hash: 'SHA-256', salt: new Uint8Array(0), info: INFO },
      base,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt'],
    );
    return { kid: servidor.kid, publica: { kty, crv, x, y }, aes };
  }
}
