import { Routes } from '@angular/router';
import { NotFoundPage } from './not-found-page';
import { ForbiddenPage } from './forbidden-page';
import { ServerErrorPage } from './server-error-page';

export const routes: Routes = [{ path: '403', component: ForbiddenPage }, { path: '500', component: ServerErrorPage }, { path: '**', component: NotFoundPage }];
