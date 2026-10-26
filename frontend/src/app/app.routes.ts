import { Routes } from '@angular/router';
import { guestsRoutes } from '@giddy/guests';
import { homeRoutes } from '@giddy/home';
import { invitationsRoutes } from '@giddy/invitations';
import { partiesRoutes } from '@giddy/parties';
import { plannerRoutes } from '@giddy/planner';
import { settingsRoutes } from '@giddy/settings';
import { notFoundRoute, systemRoutes } from '@giddy/system';
import { vendorsRoutes } from '@giddy/vendors';
import { venuesRoutes } from '@giddy/venues';

export const routes: Routes = [
  ...homeRoutes,
  ...guestsRoutes,
  ...invitationsRoutes,
  ...partiesRoutes,
  ...plannerRoutes,
  ...settingsRoutes,
  ...vendorsRoutes,
  ...venuesRoutes,
  ...systemRoutes,
  ...notFoundRoute,
];
