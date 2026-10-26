import { Routes } from '@angular/router';

export const vendorsRoutes: Routes = [
  {
    path: 'vendors',
    loadComponent: () => import('./vendors-page/vendors-page').then((m) => m.VendorsPage),
    title: 'Fun & food · Giddy',
  },
];
