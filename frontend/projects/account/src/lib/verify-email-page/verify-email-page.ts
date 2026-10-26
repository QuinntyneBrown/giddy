import { HttpErrorResponse } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
  signal,
  untracked,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { AUTH_API, ApiProblem } from '@giddy/api';
import {
  AlertComponent,
  AuthCardComponent,
  ButtonComponent,
  SpinnerComponent,
} from '@giddy/components';
import { SessionStore } from '@giddy/core';
import { firstValueFrom } from 'rxjs';

type State = 'sent' | 'checking' | 'confirmed' | 'expired';

/** "Check your email", then the confirmation link itself: confirmed or expired. */
@Component({
  imports: [RouterLink, AlertComponent, AuthCardComponent, ButtonComponent, SpinnerComponent],
  templateUrl: './verify-email-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VerifyEmailPage {
  private readonly api = inject(AUTH_API);
  private readonly session = inject(SessionStore);
  /** The link's token, from the confirmation email. */
  readonly token = input<string>();
  /** Where the link was sent, after signing up. */
  readonly sent = input<string>();
  protected readonly state = signal<State>('sent');
  protected readonly email = signal('');
  protected readonly name = signal('');
  protected readonly status = signal<string | null>(null);
  protected readonly resending = signal(false);

  constructor() {
    effect(() => {
      const token = this.token();
      const sent = this.sent();
      untracked(() => {
        this.email.set(sent ?? '');
        if (token) void this.confirm(token);
      });
    });
  }

  protected async resend(): Promise<void> {
    this.resending.set(true);
    this.status.set(null);
    try {
      await firstValueFrom(this.api.resendVerification(this.email()));
      this.status.set(`We sent a new link to ${this.email()}.`);
    } catch (error) {
      this.status.set(
        error instanceof HttpErrorResponse && error.status === 429
          ? (error.error as ApiProblem).title
          : 'We couldn’t send a new link. Try again in a moment.',
      );
    } finally {
      this.resending.set(false);
    }
  }

  private async confirm(token: string): Promise<void> {
    this.state.set('checking');
    try {
      const signedIn = await firstValueFrom(this.api.verify(token));
      this.name.set(signedIn.name);
      await this.session.load();
      this.state.set('confirmed');
    } catch (error) {
      const problem =
        error instanceof HttpErrorResponse
          ? (error.error as (ApiProblem & { email?: string }) | null)
          : null;
      this.email.set(problem?.email ?? '');
      this.state.set('expired');
    }
  }
}
