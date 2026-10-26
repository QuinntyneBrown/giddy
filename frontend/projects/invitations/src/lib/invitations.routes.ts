import { Routes } from '@angular/router';

export const invitationsRoutes: Routes = [
  {
    path: 'parties/:partyId/invite',
    loadComponent: () => import('./invitation-page/invitation-page').then((m) => m.InvitationPage),
    title: 'Invitations · Giddy',
  },
];

/** A family's private RSVP link: open without an account, the token is the credential. */
export const rsvpRoutes: Routes = [
  {
    path: 'rsvp/:token',
    loadComponent: () => import('./rsvp-page/rsvp-page').then((m) => m.RsvpPage),
    title: 'Your invitation · Giddy',
  },
];
