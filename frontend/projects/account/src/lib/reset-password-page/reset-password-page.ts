import { HttpErrorResponse } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  signal,
  untracked,
  viewChild,
  Injector,
  afterNextRender,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { AUTH_API } from '@giddy/api';
import {
  AlertComponent,
  AuthCardComponent,
  ButtonComponent,
  ErrorMessage,
  ErrorSummaryComponent,
  FormFieldComponent,
  InputDirective,
  SpinnerComponent,
} from '@giddy/components';
import { SessionStore } from '@giddy/core';
import { firstValueFrom } from 'rxjs';
import { fieldErrors } from '../field-errors';

type Field = 'password' | 'confirm';
type State = 'checking' | 'ready' | 'expired' | 'done';

/** Chooses a new password from a reset link, then signs the parent in. */
@Component({
  imports: [
    RouterLink,
    AlertComponent,
    AuthCardComponent,
    ButtonComponent,
    ErrorSummaryComponent,
    FormFieldComponent,
    InputDirective,
    SpinnerComponent,
  ],
  templateUrl: './reset-password-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResetPasswordPage {
  private readonly api = inject(AUTH_API);
  private readonly session = inject(SessionStore);
  private readonly summary = viewChild(ErrorSummaryComponent);
  private readonly injector = inject(Injector);
  readonly token = input<string>();
  protected readonly state = signal<State>('checking');
  protected readonly email = signal('');
  protected readonly password = signal('');
  protected readonly confirm = signal('');
  protected readonly busy = signal(false);
  protected readonly problem = signal<string | null>(null);
  protected readonly errors = signal<Partial<Record<Field, string>>>({});
  protected readonly summaryErrors = computed<ErrorMessage[]>(() =>
    (['password', 'confirm'] as Field[])
      .filter((f) => this.errors()[f])
      .map((f) => ({ targetId: `reset-${f}`, message: this.errors()[f]! })),
  );

  constructor() {
    effect(() => {
      const token = this.token();
      untracked(() => void this.check(token ?? ''));
    });
  }

  protected async submit(): Promise<void> {
    if (this.busy()) return;
    const errors: Partial<Record<Field, string>> = {};
    if (this.password().length < 10 || !/[^A-Za-z]/.test(this.password()))
      errors.password = 'Use at least 10 characters, a number or a symbol';
    if (this.confirm() !== this.password()) errors.confirm = 'Passwords don’t match';
    this.errors.set(errors);
    if (Object.keys(errors).length) {
      this.focusSummary();
      return;
    }

    this.busy.set(true);
    this.problem.set(null);
    try {
      await firstValueFrom(
        this.api.resetPassword({
          token: this.token() ?? '',
          password: this.password(),
          confirm: this.confirm(),
        }),
      );
      await this.session.load();
      this.state.set('done');
    } catch (error) {
      const fields = fieldErrors(error, ['password', 'confirm'] as Field[]);
      if (Object.keys(fields).length) {
        this.errors.set(fields);
        this.focusSummary();
      } else if (error instanceof HttpErrorResponse && error.status === 410) {
        this.state.set('expired');
      } else {
        this.problem.set('Your password wasn’t changed. Try again in a moment.');
      }
    } finally {
      this.busy.set(false);
    }
  }

  private async check(token: string): Promise<void> {
    try {
      this.email.set((await firstValueFrom(this.api.checkReset(token))).email);
      this.state.set('ready');
    } catch {
      this.state.set('expired');
    }
  }

  /** After the summary has rendered, so keyboard and screen reader users land on it. */
  private focusSummary(): void {
    afterNextRender(() => this.summary()?.focus(), { injector: this.injector });
  }
}
