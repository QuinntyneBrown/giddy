import { Routes } from '@angular/router';

/** `page` is the `<body data-page>` slug the e2e page object anchors on (L2-095 AC1). */
export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/marketing/marketing-page').then((m) => m.MarketingPageComponent),
    data: { page: 'marketing' },
  },
];
