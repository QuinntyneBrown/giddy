import { Injectable, computed, inject, signal } from '@angular/core';
import { SESSION_API, Session } from '@giddy/api';
import { firstValueFrom } from 'rxjs';

/** Who is signed in. Loaded once before the app first renders. */
@Injectable({ providedIn: 'root' })
export class SessionStore {
  private readonly api = inject(SESSION_API);
  private readonly current = signal<Session | null>(null);
  readonly session = this.current.asReadonly();
  readonly signedIn = computed(() => this.current() !== null);

  async load(): Promise<void> {
    try {
      this.current.set(await firstValueFrom(this.api.current()));
      await firstValueFrom(this.api.refreshAntiforgeryToken());
    } catch {
      this.current.set(null);
    }
  }
}
