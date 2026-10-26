import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AUTH_API, ApiProblem } from '@giddy/api';
import {
  AlertComponent,
  AuthCardComponent,
  ButtonComponent,
  FormFieldComponent,
  InputDirective,
} from '@giddy/components';
import { isEmail } from '@giddy/core';
import { firstValueFrom } from 'rxjs';

/** Asks for a reset link; says the same whether or not the address has an account. */
@Component({
  imports: [
    RouterLink,
    AlertComponent,
    AuthCardComponent,
    ButtonComponent,
    FormFieldComponent,
    InputDirective,
  ],
  templateUrl: './forgot-password-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ForgotPasswordPage {
  private readonly api = inject(AUTH_API);
  protected readonly email = signal('');
  protected readonly busy = signal(false);
  protected readonly sent = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly problem = signal<{ heading: string; text: string } | null>(null);

  protected async submit(): Promise<void> {
    if (this.busy()) return;
    if (!isEmail(this.email())) {
      this.error.set('Enter an email address like name@example.com');
      return;
    }

    this.error.set(null);
    this.problem.set(null);
    this.busy.set(true);
    try {
      await firstValueFrom(this.api.forgotPassword(this.email().trim()));
      this.sent.set(true);
    } catch (error) {
      const problem =
        error instanceof HttpErrorResponse ? (error.error as ApiProblem | null) : null;
      this.problem.set(
        error instanceof HttpErrorResponse && error.status === 502 && problem
          ? { heading: problem.title, text: problem.detail ?? '' }
          : { heading: 'We couldn’t send the email just now', text: 'Try again in a moment.' },
      );
    } finally {
      this.busy.set(false);
    }
  }

  protected again(): void {
    this.sent.set(false);
  }
}
