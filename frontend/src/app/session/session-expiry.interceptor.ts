import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { SessionRecovery } from '@giddy/account';
import { SessionStore } from '@giddy/core';
import { catchError, from, switchMap, throwError } from 'rxjs';

/** Requests that are about the session itself, so a 401 there is an answer, not an expiry. */
const sessionPaths = ['/api/session', '/api/antiforgery', '/api/auth/'];

/**
 * When a signed-in parent's session has ended, asks for their password and then sends the request
 * again, so nothing they were doing is lost.
 */
export const sessionExpiryInterceptor: HttpInterceptorFn = (request, next) => {
  const session = inject(SessionStore);
  const recovery = inject(SessionRecovery);
  return next(request).pipe(
    catchError((error: unknown) => {
      const expired =
        error instanceof HttpErrorResponse &&
        error.status === 401 &&
        session.signedIn() &&
        !sessionPaths.some((path) => request.url.startsWith(path));
      if (!expired) return throwError(() => error);
      return from(recovery.recover()).pipe(
        switchMap((signedIn) =>
          signedIn ? next(request.clone({ setHeaders: xsrfHeader() })) : throwError(() => error),
        ),
      );
    }),
  );
};

/** The new anti-forgery token, since the request is sent again after the built-in interceptor. */
function xsrfHeader(): Record<string, string> {
  const token = document.cookie
    .split('; ')
    .find((c) => c.startsWith('XSRF-TOKEN='))
    ?.slice('XSRF-TOKEN='.length);
  return token ? { 'X-XSRF-TOKEN': decodeURIComponent(token) } : {};
}
