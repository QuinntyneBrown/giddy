import { Routes } from '@angular/router';
import { NotFoundPage } from './not-found-page';
import { ForbiddenPage } from './forbidden-page';
import { ServerErrorPage } from './server-error-page';
import { OfflinePage } from './offline-page';

export const routes: Routes = [{ path: '403', component: ForbiddenPage, title: 'No access · Giddy' }, { path: '500', component: ServerErrorPage, title: 'Something went wrong · Giddy' }, { path: 'offline', component: OfflinePage, title: 'Offline · Giddy' }, { path: '**', component: NotFoundPage, title: 'Page not found · Giddy' }];
