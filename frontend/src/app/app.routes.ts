import { Routes } from '@angular/router';
import { budgetRoutes } from '@giddy/budget';
import { guestsRoutes } from '@giddy/guests';
import { homeRoutes } from '@giddy/home';
import { invitationsRoutes } from '@giddy/invitations';
import { partiesRoutes } from '@giddy/parties';
import { plannerRoutes } from '@giddy/planner';
import { settingsRoutes } from '@giddy/settings';
import { notFoundRoute, systemRoutes } from '@giddy/system';
import { themesRoutes } from '@giddy/themes';
import { vendorsRoutes } from '@giddy/vendors';
import { venuesRoutes } from '@giddy/venues';

export const routes: Routes = [
  ...homeRoutes,
  ...guestsRoutes,
  ...budgetRoutes,
  ...invitationsRoutes,
  ...partiesRoutes,
  ...plannerRoutes,
  ...settingsRoutes,
  ...themesRoutes,
  ...vendorsRoutes,
  ...venuesRoutes,
  ...systemRoutes,
  ...notFoundRoute,
];
