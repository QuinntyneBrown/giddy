import { Routes } from '@angular/router';
import { homeRoutes } from '@giddy/home';
import { notFoundRoute, systemRoutes } from '@giddy/system';

export const routes: Routes = [...homeRoutes, ...systemRoutes, ...notFoundRoute];
