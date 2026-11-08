import { Routes } from '@angular/router';

/**
 * `page` is the `<body data-page>` slug the e2e page object anchors on (L2-095 AC1); every other
 * address shows the page (AC11).
 */
export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/marketing/marketing-page').then((m) => m.MarketingPageComponent),
    data: { page: 'marketing' },
  },
  { path: '**', redirectTo: '' },
];
