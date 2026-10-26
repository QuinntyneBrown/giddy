import { Injectable, inject } from '@angular/core';
import { GiddyDialog } from '@giddy/components';
import { SessionStore } from '@giddy/core';
import { firstValueFrom } from 'rxjs';
import { SessionExpiredData } from './session-expired-dialog/session-expired-data';
import { SessionExpiredDialog } from './session-expired-dialog/session-expired-dialog';

/**
 * When a request finds the session has ended, asks for the password once, however many requests
 * were waiting, and says whether the parent signed back in.
 */
@Injectable({ providedIn: 'root' })
export class SessionRecovery {
  private readonly dialog = inject(GiddyDialog);
  private readonly session = inject(SessionStore);
  private pending: Promise<boolean> | null = null;

  recover(): Promise<boolean> {
    const parent = this.session.session();
    if (!parent) return Promise.resolve(false);
    this.pending ??= firstValueFrom(
      this.dialog.open<boolean, SessionExpiredData, SessionExpiredDialog>(
        SessionExpiredDialog,
        { name: parent.name, email: parent.email },
        { autoFocus: '[data-initial-focus]' },
      ).closed,
    ).then((signedIn) => {
      this.pending = null;
      return !!signedIn;
    });
    return this.pending;
  }
}
