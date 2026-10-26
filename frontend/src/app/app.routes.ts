import { Routes } from '@angular/router';
import { NotFoundPage } from './not-found-page';
import { ForbiddenPage } from './forbidden-page';

export const routes: Routes = [{ path: '403', component: ForbiddenPage }, { path: '**', component: NotFoundPage }];
