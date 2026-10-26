import { HttpErrorResponse } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  afterNextRender,
  computed,
  inject,
  input,
  signal,
  viewChild,
  Injector,
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
import { SessionStore, isEmail } from '@giddy/core';
import { firstValueFrom } from 'rxjs';

type Field = 'email' | 'password';

/** Signs in with an email and password, or hands over to Google or Apple. */
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
  templateUrl: './sign-in-page.html',
  styleUrl: './sign-in-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SignInPage {
  private readonly api = inject(AUTH_API);
  private readonly router = inject(Router);
  private readonly session = inject(SessionStore);
  private readonly summary = viewChild(ErrorSummaryComponent);
  private readonly injector = inject(Injector);
  private readonly emailInput = viewChild<ElementRef<HTMLInputElement>>('emailInput');
  /** Where to go after signing in; only paths in the app. */
  readonly returnUrl = input<string>();
  /** "provider" after Google or Apple didn't sign the parent in. */
  readonly error = input<string>();
  protected readonly email = signal('');
  protected readonly password = signal('');
  protected readonly keepSignedIn = signal(false);
  protected readonly busy = signal(false);
  protected readonly problem = signal<{ heading: string; text: string } | null>(null);
  protected readonly errors = signal<Partial<Record<Field, string>>>({});
  protected readonly summaryErrors = computed<ErrorMessage[]>(() =>
    (['email', 'password'] as Field[])
      .filter((f) => this.errors()[f])
      .map((f) => ({ targetId: `signin-${f}`, message: this.errors()[f]! })),
  );
  protected readonly target = computed(() => {
    const url = this.returnUrl();
    return url?.startsWith('/') && !url.startsWith('//') ? url : '/';
  });
  protected readonly providerProblem = computed(() => this.error() === 'provider');

  constructor() {
    afterNextRender(() => this.emailInput()?.nativeElement.focus());
  }

  protected providerLink(provider: string): string {
    return `/api/auth/external/${provider}?returnUrl=${encodeURIComponent(this.target())}`;
  }

  protected async submit(): Promise<void> {
    if (this.busy()) return;
    const errors: Partial<Record<Field, string>> = {};
    if (!isEmail(this.email())) errors.email = 'Enter an email address like name@example.com';
    if (!this.password()) errors.password = 'Enter your password';
    this.errors.set(errors);
    if (Object.keys(errors).length) {
      this.focusSummary();
      return;
    }

    this.busy.set(true);
    this.problem.set(null);
    try {
      await firstValueFrom(
        this.api.signIn({
          email: this.email().trim(),
          password: this.password(),
          keepSignedIn: this.keepSignedIn(),
        }),
      );
      await this.session.load();
      await this.router.navigateByUrl(this.target());
    } catch (error) {
      const problem =
        error instanceof HttpErrorResponse ? (error.error as ApiProblem | null) : null;
      this.password.set('');
      this.problem.set(
        error instanceof HttpErrorResponse && [401, 423].includes(error.status) && problem
          ? { heading: problem.title, text: problem.detail ?? '' }
          : error instanceof HttpErrorResponse && error.status === 429
            ? { heading: 'Too many tries from here', text: 'Wait a minute, then try again.' }
            : { heading: 'We couldn’t sign you in', text: 'Try again in a moment.' },
      );
    } finally {
      this.busy.set(false);
    }
  }

  /** After the summary has rendered, so keyboard and screen reader users land on it. */
  private focusSummary(): void {
    afterNextRender(() => this.summary()?.focus(), { injector: this.injector });
  }
}
