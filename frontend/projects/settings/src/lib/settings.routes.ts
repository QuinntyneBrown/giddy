import { Routes } from '@angular/router';

export const settingsRoutes: Routes = [
  {
    path: 'settings',
    loadComponent: () => import('./settings-page/settings-page').then((m) => m.SettingsPage),
    title: 'Settings · Giddy',
  },
];
