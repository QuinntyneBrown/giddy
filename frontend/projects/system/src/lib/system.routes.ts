import { Routes } from '@angular/router';
import { OfflinePage } from './offline/offline-page';

/** The offline page is bundled eagerly so it can show when nothing else can be downloaded. */
export const systemRoutes: Routes = [
  {
    path: '403',
    loadComponent: () => import('./forbidden/forbidden-page').then((m) => m.ForbiddenPage),
    title: 'Private plan · Giddy',
  },
  {
    path: '404',
    loadComponent: () => import('./not-found/not-found-page').then((m) => m.NotFoundPage),
    title: 'Page not found · Giddy',
  },
  {
    path: '500',
    loadComponent: () => import('./server-error/server-error-page').then((m) => m.ServerErrorPage),
    title: 'Something went wrong · Giddy',
  },
  { path: 'offline', component: OfflinePage, title: 'Offline · Giddy' },
];

/** Must be the last route: every unknown path shows the not-found page. */
export const notFoundRoute: Routes = [
  {
    path: '**',
    loadComponent: () => import('./not-found/not-found-page').then((m) => m.NotFoundPage),
    title: 'Page not found · Giddy',
  },
];
