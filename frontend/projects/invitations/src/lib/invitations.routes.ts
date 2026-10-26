import { Routes } from '@angular/router';

export const invitationsRoutes: Routes = [
  {
    path: 'parties/:partyId/invite',
    loadComponent: () => import('./invitation-page/invitation-page').then((m) => m.InvitationPage),
    title: 'Invitations · Giddy',
  },
  {
    path: 'rsvp/:token',
    loadComponent: () => import('./rsvp-page/rsvp-page').then((m) => m.RsvpPage),
    title: 'Your invitation · Giddy',
  },
];
