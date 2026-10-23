import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    title: 'Verdemagenta · Trapillo por color, pedidos por WhatsApp',
    loadComponent: () => import('./paginas/inicio/inicio').then((m) => m.Inicio),
  },
  {
    path: 'tienda',
    title: 'Tienda · Verdemagenta',
    loadComponent: () => import('./paginas/tienda/tienda').then((m) => m.Tienda),
  },
  {
    path: 'producto/:id',
    title: 'Producto · Verdemagenta',
    loadComponent: () => import('./paginas/producto/producto').then((m) => m.ProductoPagina),
  },
  {
    path: 'pedido',
    title: 'Tu pedido · Verdemagenta',
    loadComponent: () => import('./paginas/pedido/pedido').then((m) => m.Pedido),
  },
  {
    path: 'privacidad',
    title: 'Aviso de privacidad · Verdemagenta',
    loadComponent: () => import('./paginas/privacidad').then((m) => m.Privacidad),
  },
  {
    path: '**',
    title: 'Página no encontrada · Verdemagenta',
    loadComponent: () => import('./paginas/no-encontrada').then((m) => m.NoEncontrada),
  },
];
