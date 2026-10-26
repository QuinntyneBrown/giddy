import { provideHttpClient, withInterceptors, withXsrfConfiguration } from '@angular/common/http';
import {
  ApplicationConfig,
  LOCALE_ID,
  inject,
  isDevMode,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import {
  provideRouter,
  withComponentInputBinding,
  withNavigationErrorHandler,
} from '@angular/router';
import { provideServiceWorker } from '@angular/service-worker';
import { provideGiddyApi } from '@giddy/api';
import { navigationErrorRedirect } from '@giddy/system';
import { routes } from './app.routes';
import { sessionExpiryInterceptor } from './session/session-expiry.interceptor';
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
      withInterceptors([sessionExpiryInterceptor]),
    ),
    provideGiddyApi(),
    provideAppInitializer(() => inject(SessionStore).load()),
    { provide: LOCALE_ID, useValue: 'en-CA' },
    // The app shell is cached so a saved run sheet opens with no connection. Party data is kept
    // separately on the device (OfflineStore), never in the service worker's cache.
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000',
    }),
  ],
};
