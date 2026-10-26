import { Routes } from '@angular/router';
import { HomePage } from './home-page';

export const homeRoutes: Routes = [
  { path: '', pathMatch: 'full', component: HomePage, title: 'Home · Giddy' },
];
