import { Routes } from '@angular/router';

export const notificationsRoutes: Routes = [
  {
    path: 'notifications',
    loadComponent: () =>
      import('./notifications-page/notifications-page').then((m) => m.NotificationsPage),
    title: 'Notifications · Giddy',
  },
];
