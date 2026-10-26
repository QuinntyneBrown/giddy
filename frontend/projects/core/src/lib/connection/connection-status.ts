import { DOCUMENT } from '@angular/common';
import { DestroyRef, Injectable, inject, signal } from '@angular/core';

/** Whether the device has a connection, and whether it has just come back. */
@Injectable({ providedIn: 'root' })
export class ConnectionStatus {
  private readonly window = inject(DOCUMENT).defaultView!;
  private readonly isOnline = signal(this.window.navigator.onLine);
  private readonly justReconnected = signal(false);
  readonly online = this.isOnline.asReadonly();
  readonly reconnected = this.justReconnected.asReadonly();

  constructor() {
    const goOffline = () => {
      this.isOnline.set(false);
      this.justReconnected.set(false);
    };
    const goOnline = () => {
      this.isOnline.set(true);
      this.justReconnected.set(true);
    };
    this.window.addEventListener('offline', goOffline);
    this.window.addEventListener('online', goOnline);
    inject(DestroyRef).onDestroy(() => {
      this.window.removeEventListener('offline', goOffline);
      this.window.removeEventListener('online', goOnline);
    });
  }

  acknowledgeReconnected(): void {
    this.justReconnected.set(false);
  }
}
