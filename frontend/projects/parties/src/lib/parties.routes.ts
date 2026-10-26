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

/** Accepting an invitation needs a signed-in parent; the guard brings them back here. */
export const joinRoutes: Routes = [
  {
    path: 'join/:token',
    loadComponent: () => import('./join-page/join-page').then((m) => m.JoinPage),
    title: 'Join a party plan · Giddy',
  },
];

/** The view-only link is open to anyone who has it. */
export const sharedRoutes: Routes = [
  {
    path: 'shared/:token',
    loadComponent: () => import('./shared-page/shared-page').then((m) => m.SharedPage),
    title: 'Party plan · Giddy',
  },
];
