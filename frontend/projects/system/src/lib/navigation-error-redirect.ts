import { inject } from '@angular/core';
import { NavigationError, RedirectCommand, Router } from '@angular/router';

/**
 * When a page cannot be loaded, show the offline page if the device has no connection and the
 * server-error page otherwise. The shell and navigation stay in place either way.
 */
export function navigationErrorRedirect(error: NavigationError): RedirectCommand {
  const router = inject(Router);
  const target = navigator.onLine ? '/500' : '/offline';
  return new RedirectCommand(router.createUrlTree([target], { queryParams: { from: error.url } }));
}
