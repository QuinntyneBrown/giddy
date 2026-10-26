import { Routes } from '@angular/router';

export const partiesRoutes: Routes = [
  {
    path: 'parties',
    loadComponent: () => import('./parties-list/parties-page').then((m) => m.PartiesPage),
    title: 'My parties · Giddy',
  },
  {
    path: 'parties/new',
    loadComponent: () => import('./new-party/new-party-page').then((m) => m.NewPartyPage),
    title: 'Plan a new party · Giddy',
  },
  {
    path: 'parties/:partyId',
    loadComponent: () =>
      import('./party-overview/party-overview-page').then((m) => m.PartyOverviewPage),
    title: 'Party overview · Giddy',
  },
];
