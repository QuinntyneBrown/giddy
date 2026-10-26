import { Routes } from '@angular/router';

export const familyRoutes: Routes = [
  {
    path: 'family',
    loadComponent: () => import('./family-page/family-page').then((m) => m.FamilyPage),
    title: 'Family · Giddy',
  },
  {
    path: 'welcome',
    loadComponent: () => import('./welcome-page/welcome-page').then((m) => m.WelcomePage),
    title: 'Set up your family · Giddy',
  },
];
