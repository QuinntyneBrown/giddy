import { Routes } from '@angular/router';

export const invitationsRoutes: Routes = [
  {
    path: 'parties/:partyId/invite',
    loadComponent: () => import('./invitation-page/invitation-page').then((m) => m.InvitationPage),
    title: 'Invitations · Giddy',
  },
];
