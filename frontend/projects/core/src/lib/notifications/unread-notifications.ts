import { Injectable, effect, inject, signal, untracked } from '@angular/core';
import { NOTIFICATIONS_API } from '@giddy/api';
import { firstValueFrom } from 'rxjs';
import { LiveUpdates } from '../live/live-updates';
import { SessionStore } from '../session/session.store';

/** How many notifications the signed-in parent hasn't read, for the bell and the menus. */
@Injectable({ providedIn: 'root' })
export class UnreadNotifications {
  private readonly api = inject(NOTIFICATIONS_API);
  private readonly session = inject(SessionStore);
  private readonly unread = signal(0);
  readonly count = this.unread.asReadonly();

  constructor() {
    const live = inject(LiveUpdates);
    effect(() => {
      live.version();
      if (this.session.signedIn()) untracked(() => void this.refresh());
      else this.unread.set(0);
    });
  }

  async refresh(): Promise<void> {
    try {
      this.unread.set((await firstValueFrom(this.api.unreadCount())).unread);
    } catch {
      // The count stays as it was; the centre itself shows any problem.
    }
  }

  /** After reading on the page, the count the API answered with. */
  set(unread: number): void {
    this.unread.set(unread);
  }
}
