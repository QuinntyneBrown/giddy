import { Routes } from '@angular/router';

export const plannerRoutes: Routes = [
  {
    path: 'ask-giddy',
    loadComponent: () => import('./planner-chat-page').then((m) => m.PlannerChatPage),
    title: 'Ask Giddy · Giddy',
  },
];
