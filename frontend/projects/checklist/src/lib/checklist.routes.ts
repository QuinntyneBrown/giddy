import { Routes } from '@angular/router';

export const checklistRoutes: Routes = [
  {
    path: 'parties/:partyId/checklist',
    loadComponent: () => import('./checklist-page/checklist-page').then((m) => m.ChecklistPage),
    title: 'Checklist · Giddy',
  },
];
