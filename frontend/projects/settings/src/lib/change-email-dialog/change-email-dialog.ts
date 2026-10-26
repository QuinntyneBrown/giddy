import { DialogRef } from '@angular/cdk/dialog';
import { HttpErrorResponse } from '@angular/common/http';
import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  inject,
  Injector,
  signal,
  viewChild,
} from '@angular/core';
import { ApiProblem, SETTINGS_API } from '@giddy/api';
import {
  AlertComponent,
  ButtonComponent,
  DialogComponent,
  ErrorSummaryComponent,
  FormFieldComponent,
  InputDirective,
} from '@giddy/components';
import { SessionStore, isEmail } from '@giddy/core';
import { firstValueFrom } from 'rxjs';

const emailMessage = 'Enter an email address like name@example.com';

/** Asks for a new sign-in email; it replaces the old one only once its link is opened. */
@Component({
  imports: [
    AlertComponent,
    ButtonComponent,
    DialogComponent,
    ErrorSummaryComponent,
    FormFieldComponent,
    InputDirective,
  ],
  templateUrl: './change-email-dialog.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChangeEmailDialog {
  private readonly api = inject(SETTINGS_API);
  private readonly dialogRef = inject<DialogRef<string>>(DialogRef);
  private readonly injector = inject(Injector);
  private readonly summary = viewChild(ErrorSummaryComponent);
  protected readonly current = inject(SessionStore).session()?.email ?? '';
  protected readonly email = signal('');
  protected readonly error = signal<string | null>(null);
  protected readonly problem = signal<string | null>(null);
  protected readonly busy = signal(false);

  protected cancel(): void {
    this.dialogRef.close();
  }

  protected async send(): Promise<void> {
    const email = this.email().trim();
    if (!isEmail(email)) {
      this.showError(emailMessage);
      return;
    }

    this.busy.set(true);
    this.error.set(null);
    this.problem.set(null);
    try {
      await firstValueFrom(this.api.changeEmail(email));
      this.dialogRef.close(email.toLowerCase());
    } catch (error) {
      const problem =
        error instanceof HttpErrorResponse ? (error.error as ApiProblem | null) : null;
      if (error instanceof HttpErrorResponse && error.status === 400 && problem?.errors) {
        this.showError(problem.errors['email']?.[0] ?? emailMessage);
      } else {
        this.problem.set('The link didn’t send. Try again in a moment.');
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
