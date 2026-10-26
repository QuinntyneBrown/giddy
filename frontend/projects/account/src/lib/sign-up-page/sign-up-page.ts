import { HttpErrorResponse } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
  viewChild,
  Injector,
  afterNextRender,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AUTH_API, ApiProblem } from '@giddy/api';
import {
  AlertComponent,
  AuthCardComponent,
  ButtonComponent,
  ChoiceComponent,
  ErrorMessage,
  ErrorSummaryComponent,
  FormFieldComponent,
  InputDirective,
} from '@giddy/components';
import { isEmail } from '@giddy/core';
import { firstValueFrom } from 'rxjs';
import { fieldErrors } from '../field-errors';

type Field = 'firstName' | 'email' | 'password' | 'postalCode';
const fieldOrder: Field[] = ['firstName', 'email', 'password', 'postalCode'];

/** Creates an account: first name, email, password and postal code. */
@Component({
  imports: [
    RouterLink,
    AlertComponent,
    AuthCardComponent,
    ButtonComponent,
    ChoiceComponent,
    ErrorSummaryComponent,
    FormFieldComponent,
    InputDirective,
  ],
  templateUrl: './sign-up-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SignUpPage {
  private readonly api = inject(AUTH_API);
  private readonly router = inject(Router);
  private readonly summary = viewChild(ErrorSummaryComponent);
  private readonly injector = inject(Injector);
  protected readonly firstName = signal('');
  protected readonly email = signal('');
  protected readonly password = signal('');
  protected readonly postalCode = signal('');
  protected readonly marketing = signal(false);
  protected readonly busy = signal(false);
  /** The email that already has an account, or a general problem. */
  protected readonly existing = signal<string | null>(null);
  protected readonly problem = signal<string | null>(null);
  protected readonly errors = signal<Partial<Record<Field, string>>>({});
  protected readonly summaryErrors = computed<ErrorMessage[]>(() =>
    fieldOrder
      .filter((f) => this.errors()[f])
      .map((f) => ({ targetId: `signup-${f}`, message: this.errors()[f]! })),
  );

  protected async submit(): Promise<void> {
    if (this.busy()) return;
    if (!this.validate()) {
      this.focusSummary();
      return;
    }

    this.busy.set(true);
    this.existing.set(null);
    this.problem.set(null);
    try {
      const { email } = await firstValueFrom(
        this.api.signUp({
          firstName: this.firstName().trim(),
          email: this.email().trim(),
          password: this.password(),
          postalCode: this.postalCode().trim(),
          marketing: this.marketing(),
        }),
      );
      await this.router.navigate(['/verify-email'], { queryParams: { sent: email } });
    } catch (error) {
      const errors = fieldErrors(error, fieldOrder);
      if (Object.keys(errors).length) {
        this.errors.set(errors);
        this.focusSummary();
      } else if (error instanceof HttpErrorResponse && error.status === 409) {
        this.existing.set(this.email().trim());
      } else {
        this.problem.set(
          error instanceof HttpErrorResponse && error.status === 429
            ? 'Too many tries from here. Wait a minute, then try again.'
            : (((error as HttpErrorResponse).error as ApiProblem | null)?.title ??
                'We couldn’t create your account. Try again in a moment.'),
        );
      }
    } finally {
      this.busy.set(false);
    }
  }

  private validate(): boolean {
    const errors: Partial<Record<Field, string>> = {};
    if (!this.firstName().trim()) errors.firstName = 'Enter your first name';
    if (!isEmail(this.email())) errors.email = 'Enter an email address like name@example.com';
    const password = this.password();
    if (password.length < 10 || !/[^A-Za-z]/.test(password))
      errors.password = 'Use at least 10 characters, a number or a symbol';
    // Toronto (M) and the surrounding region (L); the API checks the exact areas Giddy covers.
    if (!/^[MLml]\d[A-Za-z] ?\d[A-Za-z]\d$/.test(this.postalCode().trim()))
      errors.postalCode = 'Enter a postal code in the GTA, like M4M 1H1';
    this.errors.set(errors);
    return Object.keys(errors).length === 0;
  }

  /** After the summary has rendered, so keyboard and screen reader users land on it. */
  private focusSummary(): void {
    afterNextRender(() => this.summary()?.focus(), { injector: this.injector });
  }
}
