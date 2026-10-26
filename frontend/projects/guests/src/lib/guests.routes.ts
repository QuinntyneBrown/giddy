import { Routes } from '@angular/router';

export const guestsRoutes: Routes = [
  {
    path: 'parties/:partyId/guests',
    loadComponent: () => import('./guests-page/guests-page').then((m) => m.GuestsPage),
    title: 'Guests · Giddy',
  },
];
