import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'mapa', pathMatch: 'full' },
  {
    path: 'mapa',
    loadComponent: () => import('./features/map/map').then((m) => m.Map),
    title: 'Mapa · Medievalismes',
  },
  {
    path: 'descobreix',
    loadComponent: () => import('./features/discover/discover').then((m) => m.Discover),
    title: 'Descobreix · Medievalismes',
  },
  {
    path: 'desats',
    loadComponent: () => import('./features/saved/saved').then((m) => m.Saved),
    title: 'Desats · Medievalismes',
  },
  {
    path: 'perfil',
    loadComponent: () => import('./features/profile/profile').then((m) => m.Profile),
    title: 'Perfil · Medievalismes',
  },
  {
    path: 'privadesa',
    loadComponent: () => import('./features/privacy/privacy').then((m) => m.Privacy),
    title: 'Privadesa · Medievalismes',
  },
  {
    path: 'lloc/:slug',
    loadComponent: () => import('./features/place/place').then((m) => m.Place),
    title: 'Medievalismes',
  },
  {
    path: 'coleccio/:slug',
    loadComponent: () => import('./features/collection/collection').then((m) => m.Collection),
    title: 'Medievalismes',
  },
  { path: '**', redirectTo: 'mapa' },
];
