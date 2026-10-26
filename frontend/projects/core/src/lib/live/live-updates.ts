import { DestroyRef, Injectable, inject, signal } from '@angular/core';
import { LIVE_UPDATES_API, LiveUpdate } from '@giddy/api';
import { Subscription, catchError, of, switchMap, timer } from 'rxjs';

/** How often Giddy asks for news while it is open; replies show within five seconds. */
export const livePollMilliseconds = 3000;

/**
 * Polls for replies, opens and bounces on the parent's parties while Giddy is open. Pages read
 * `version` to refresh their counts; the live toasts read `latest`.
 */
@Injectable({ providedIn: 'root' })
export class LiveUpdates {
  private readonly api = inject(LIVE_UPDATES_API);
  private cursor: number | null = null;
  private polling: Subscription | null = null;
  private readonly batch = signal<LiveUpdate[]>([]);
  private readonly changes = signal(0);

  /** The newest updates, replaced on each poll that brings any. */
  readonly latest = this.batch.asReadonly();
  /** Increases whenever updates arrive. */
  readonly version = this.changes.asReadonly();

  constructor() {
    inject(DestroyRef).onDestroy(() => this.stop());
  }

  start(): void {
    if (this.polling) return;
    this.polling = timer(0, livePollMilliseconds)
      .pipe(switchMap(() => this.api.poll(this.cursor).pipe(catchError(() => of(null)))))
      .subscribe((updates) => {
        if (!updates) return;
        const first = this.cursor === null;
        this.cursor = updates.cursor;
        if (!first && updates.events.length) {
          this.batch.set(updates.events);
          this.changes.update((v) => v + 1);
        }
      });
  }

  stop(): void {
    this.polling?.unsubscribe();
    this.polling = null;
    this.cursor = null;
  }
}
