import { inject } from '@angular/core';
import { CanActivateChildFn, Router } from '@angular/router';
import { SessionStore } from './session.store';

/** Sends a visitor to sign in, and back to the page they asked for afterwards. */
export const signedInGuard: CanActivateChildFn = (_, state) =>
  inject(SessionStore).signedIn() ||
  inject(Router).createUrlTree(['/sign-in'], { queryParams: { returnUrl: state.url } });
