import { Routes } from '@angular/router';

export const themesRoutes: Routes = [
  {
    path: 'themes',
    loadComponent: () => import('./themes-page/themes-page').then((m) => m.ThemesPage),
    title: 'Party themes · Giddy',
  },
];
