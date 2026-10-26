import { Routes } from '@angular/router';

export const budgetRoutes: Routes = [
  {
    path: 'parties/:partyId/budget',
    loadComponent: () => import('./budget-page/budget-page').then((m) => m.BudgetPage),
    title: 'Budget · Giddy',
  },
];
