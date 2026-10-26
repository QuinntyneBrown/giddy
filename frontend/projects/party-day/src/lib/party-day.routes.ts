import { Routes } from '@angular/router';

export const partyDayRoutes: Routes = [
  {
    path: 'parties/:partyId/day',
    loadComponent: () => import('./party-day-page/party-day-page').then((m) => m.PartyDayPage),
    title: 'Party day · Giddy',
  },
];
