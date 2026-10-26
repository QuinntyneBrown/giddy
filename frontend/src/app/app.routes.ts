import { Routes } from '@angular/router';
import { homeRoutes } from '@giddy/home';
import { partiesRoutes } from '@giddy/parties';
import { plannerRoutes } from '@giddy/planner';
import { settingsRoutes } from '@giddy/settings';
import { notFoundRoute, systemRoutes } from '@giddy/system';

export const routes: Routes = [
  ...homeRoutes,
  ...partiesRoutes,
  ...plannerRoutes,
  ...settingsRoutes,
  ...systemRoutes,
  ...notFoundRoute,
];
