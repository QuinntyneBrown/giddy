import { Routes } from '@angular/router';
import { NotFoundPage } from './not-found-page';

export const routes: Routes = [{ path: '**', component: NotFoundPage }];
