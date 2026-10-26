import { Routes } from '@angular/router';

export const venuesRoutes: Routes = [
  {
    path: 'venues',
    loadComponent: () => import('./venues-page/venues-page').then((m) => m.VenuesPage),
    title: 'Venues · Giddy',
  },
  {
    path: 'venues/compare',
    loadComponent: () => import('./compare/compare-venues-page').then((m) => m.CompareVenuesPage),
    title: 'Compare venues · Giddy',
  },
  {
    path: 'venues/:venueId',
    loadComponent: () => import('./venue-detail/venue-detail-page').then((m) => m.VenueDetailPage),
    title: 'Venue · Giddy',
  },
];
