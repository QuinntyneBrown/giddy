import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AUTH_API } from '@giddy/api';
import {
  ButtonComponent,
  DialogComponent,
  FormFieldComponent,
  InputDirective,
} from '@giddy/components';
import { SessionStore } from '@giddy/core';
import { firstValueFrom } from 'rxjs';
import { SessionExpiredData } from './session-expired-data';

/** "Still there?": the password again, and whatever the parent was doing carries on. */
@Component({
  imports: [ButtonComponent, DialogComponent, FormFieldComponent, InputDirective],
  templateUrl: './session-expired-dialog.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SessionExpiredDialog {
  private readonly api = inject(AUTH_API);
  private readonly session = inject(SessionStore);
  private readonly router = inject(Router);
  private readonly dialogRef = inject<DialogRef<boolean>>(DialogRef);
  protected readonly data = inject<SessionExpiredData>(DIALOG_DATA);
  protected readonly password = signal('');
  protected readonly busy = signal(false);
  protected readonly error = signal<string | null>(null);

  protected async signBackIn(): Promise<void> {
    if (!this.password()) {
      this.error.set('Enter your password');
      return;
    }

    this.busy.set(true);
    this.error.set(null);
    try {
      await firstValueFrom(
        this.api.signIn({ email: this.data.email, password: this.password(), keepSignedIn: false }),
      );
      await this.session.load();
      this.dialogRef.close(true);
    } catch (error) {
      this.error.set(
        error instanceof HttpErrorResponse && error.status === 401
          ? 'That password isn’t right. Try again or reset it.'
          : error instanceof HttpErrorResponse && error.status === 423
            ? 'Sign-in is paused for 15 minutes. Reset your password to get back in now.'
            : 'We couldn’t sign you back in. Try again in a moment.',
      );
    } finally {
      this.busy.set(false);
    }
  }

  protected async leave(path: string): Promise<void> {
    this.session.clear();
    this.dialogRef.close(false);
    await this.router.navigateByUrl(path);
  }
}
