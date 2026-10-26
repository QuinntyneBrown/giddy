import { Routes } from '@angular/router';

export const wrapUpRoutes: Routes = [
  {
    path: 'parties/:partyId/wrap-up',
    loadComponent: () => import('./wrap-up-page/wrap-up-page').then((m) => m.WrapUpPage),
    title: 'Wrap-up · Giddy',
  },
];
