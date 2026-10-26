import { DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AUTH_API } from '@giddy/api';
import { AlertComponent, ButtonComponent, DialogComponent } from '@giddy/components';
import { OfflineStore, SessionStore } from '@giddy/core';
import { firstValueFrom } from 'rxjs';

/** Ends the session on the server and removes what this device saved for offline use. */
@Component({
  imports: [AlertComponent, ButtonComponent, DialogComponent],
  templateUrl: './sign-out-dialog.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SignOutDialog {
  private readonly api = inject(AUTH_API);
  private readonly store = inject(OfflineStore);
  private readonly router = inject(Router);
  private readonly dialogRef = inject<DialogRef<boolean>>(DialogRef);
  protected readonly session = inject(SessionStore);
  protected readonly busy = signal(false);
  protected readonly failed = signal(false);

  protected cancel(): void {
    this.dialogRef.close(false);
  }

  protected async signOut(): Promise<void> {
    this.busy.set(true);
    this.failed.set(false);
    try {
      await firstValueFrom(this.api.signOut());
      await this.store.clear();
      this.session.clear();
      this.dialogRef.close(true);
      await this.session.load();
      await this.router.navigateByUrl('/sign-in');
    } catch {
      this.failed.set(true);
    } finally {
      this.busy.set(false);
    }
  }
}
