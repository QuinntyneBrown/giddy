import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, from, switchMap, tap, throwError } from 'rxjs';
import { OfflineStore } from './offline-store';

/**
 * Keeps a copy of what a page loaded, and serves it when the device can't reach Giddy. Only a
 * network failure falls back to the copy; an answer from the server, even an error, is shown.
 */
@Injectable({ providedIn: 'root' })
export class OfflineCache {
  private readonly store = inject(OfflineStore);

  load<T>(key: string, request: Observable<T>): Observable<T> {
    return request.pipe(
      tap((value) => void this.store.set(key, value)),
      catchError((error: unknown) =>
        error instanceof HttpErrorResponse && error.status === 0
          ? from(this.store.get<T>(key)).pipe(
              switchMap((saved) => (saved === null ? throwError(() => error) : [saved])),
            )
          : throwError(() => error),
      ),
    );
  }

  /** Replaces the device's copy, for a change made while offline. */
  save(key: string, value: unknown): Promise<void> {
    return this.store.set(key, value);
  }
}
