import { Routes } from '@angular/router';
import { accountRoutes } from '@giddy/account';
import { budgetRoutes } from '@giddy/budget';
import { checklistRoutes } from '@giddy/checklist';
import { signedInGuard } from '@giddy/core';
import { familyRoutes } from '@giddy/family';
import { partyDayRoutes } from '@giddy/party-day';
import { guestsRoutes } from '@giddy/guests';
import { homeRoutes } from '@giddy/home';
import { notificationsRoutes } from '@giddy/notifications';
import { invitationsRoutes, rsvpRoutes } from '@giddy/invitations';
import { joinRoutes, partiesRoutes, sharedRoutes } from '@giddy/parties';
import { plannerRoutes } from '@giddy/planner';
import { settingsRoutes } from '@giddy/settings';
import { notFoundRoute, systemRoutes } from '@giddy/system';
import { themesRoutes } from '@giddy/themes';
import { vendorsRoutes } from '@giddy/vendors';
import { venuesRoutes } from '@giddy/venues';

export const routes: Routes = [
  // Open to visitors: accounts, private RSVP links and the system pages.
  ...accountRoutes,
  ...rsvpRoutes,
  ...sharedRoutes,
  ...systemRoutes,
  {
    path: '',
    canActivateChild: [signedInGuard],
    children: [
      ...homeRoutes,
      ...familyRoutes,
      ...notificationsRoutes,
      ...guestsRoutes,
      ...budgetRoutes,
      ...checklistRoutes,
      ...partyDayRoutes,
      ...invitationsRoutes,
      ...partiesRoutes,
      ...joinRoutes,
      ...plannerRoutes,
      ...settingsRoutes,
      ...themesRoutes,
      ...vendorsRoutes,
      ...venuesRoutes,
    ],
  },
  ...notFoundRoute,
];
