import { provideHttpClient, withXsrfConfiguration } from '@angular/common/http';
import {
  ApplicationConfig,
  LOCALE_ID,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import {
  provideRouter,
  withComponentInputBinding,
  withNavigationErrorHandler,
} from '@angular/router';
import { provideGiddyApi } from '@giddy/api';
import { navigationErrorRedirect } from '@giddy/system';
import { routes } from './app.routes';
import { SessionStore } from '@giddy/core';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      routes,
      withComponentInputBinding(),
      withNavigationErrorHandler(navigationErrorRedirect),
    ),
    provideHttpClient(
      withXsrfConfiguration({ cookieName: 'XSRF-TOKEN', headerName: 'X-XSRF-TOKEN' }),
    ),
    provideGiddyApi(),
    provideAppInitializer(() => inject(SessionStore).load()),
    { provide: LOCALE_ID, useValue: 'en-CA' },
  ],
};
