import { DialogRef } from '@angular/cdk/dialog';
import { HttpErrorResponse } from '@angular/common/http';
import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  Injector,
  signal,
  viewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { ApiProblem, PRIVACY_API } from '@giddy/api';
import {
  AlertComponent,
  ButtonComponent,
  DialogComponent,
  ErrorSummaryComponent,
  FormFieldComponent,
  InputDirective,
} from '@giddy/components';
import { OfflineStore, ResourceLoader, SessionStore } from '@giddy/core';
import { firstValueFrom } from 'rxjs';

/**
 * Deletes the parent's account once they type their sign-in email, warning first that live
 * bookings are not cancelled. Signs out and leaves this device's saved data behind.
 */
@Component({
  imports: [
    AlertComponent,
    ButtonComponent,
    DialogComponent,
    ErrorSummaryComponent,
    FormFieldComponent,
    InputDirective,
  ],
  templateUrl: './delete-account-dialog.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeleteAccountDialog {
  private readonly api = inject(PRIVACY_API);
  private readonly store = inject(OfflineStore);
  private readonly router = inject(Router);
  private readonly session = inject(SessionStore);
  private readonly dialogRef = inject<DialogRef<boolean>>(DialogRef);
  private readonly injector = inject(Injector);
  private readonly summary = viewChild(ErrorSummaryComponent);
  protected readonly email = this.session.session()?.email ?? '';
  protected readonly check = new ResourceLoader(() => this.api.deletionCheck());
  protected readonly typed = signal('');
  protected readonly error = signal<string | null>(null);
  protected readonly problem = signal<string | null>(null);
  protected readonly busy = signal(false);
  protected readonly bookingWarning = computed(() => {
    const count = this.check.value()?.liveBookings ?? 0;
    if (count === 0) return null;
    return count === 1 ? '1 booking isn’t cancelled' : `${count} bookings aren’t cancelled`;
  });

  protected cancel(): void {
    this.dialogRef.close(false);
  }

  protected async remove(): Promise<void> {
    if (this.typed().trim().toLowerCase() !== this.email.toLowerCase()) {
      this.showError(`Type the email you sign in with, ${this.email}`);
      return;
    }

    this.busy.set(true);
    this.error.set(null);
    this.problem.set(null);
    try {
      await firstValueFrom(this.api.deleteAccount(this.typed().trim()));
      await this.store.clear();
      this.session.clear();
      this.dialogRef.close(true);
      await this.session.load();
      await this.router.navigateByUrl('/sign-in');
    } catch (error) {
      const problem =
        error instanceof HttpErrorResponse ? (error.error as ApiProblem | null) : null;
      if (
        error instanceof HttpErrorResponse &&
        error.status === 400 &&
        problem?.errors?.['email']
      ) {
        this.showError(problem.errors['email'][0]);
      } else {
        this.problem.set('Your account is still here. Try again in a moment.');
      }
    } finally {
      this.busy.set(false);
    }
  }

  private showError(message: string): void {
    this.error.set(message);
    afterNextRender(() => this.summary()?.focus(), { injector: this.injector });
  }
}
