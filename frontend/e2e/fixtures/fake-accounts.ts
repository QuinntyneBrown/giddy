import { Request } from '@playwright/test';
import { FakeResponse } from './fake-planner';
import { amara, SeedSession } from './seed-data';

type Register = (
  method: string,
  path: string,
  handler: (request: Request, params: Record<string, string>) => FakeResponse,
) => void;

export const demoPassword = 'dino-dig-2026';
const problem = (status: number, title: string, extra: Record<string, unknown> = {}) => ({
  status,
  body: { status, title, ...extra },
});
const strong = (password: string) => password.length >= 10 && /[^A-Za-z]/.test(password);
const isEmail = (email: string) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);

/** Sign-up, confirmation links, sign-in and out, and password resets, as the API answers them. */
export class FakeAccounts {
  /** Addresses that already have accounts. */
  registered = new Set([amara.email]);
  /** Bodies of POST /api/auth/sign-up, newest last. */
  signUps: Record<string, unknown>[] = [];
  /** Bodies of POST /api/auth/sign-in, newest last. */
  signIns: Record<string, unknown>[] = [];
  resends = 0;
  /** When set, resending a link answers 429 with this wait. */
  resendWaitSeconds: number | null = null;
  /** When set, the email service is down. */
  emailDown = false;
  /** What Google or Apple returns: a new account, an existing one, or an error. */
  provider: 'new' | 'existing' | 'error' = 'new';

  constructor(private readonly setSession: (session: SeedSession | null) => void) {}

  register(on: Register): void {
    on('POST', '/api/auth/sign-up', (request) => {
      const body = request.postDataJSON() as Record<string, string>;
      this.signUps.push(body);
      const errors: Record<string, string[]> = {};
      if (!body['firstName']?.trim()) errors['firstName'] = ['Enter your first name'];
      if (!isEmail(body['email'] ?? ''))
        errors['email'] = ['Enter an email address like name@example.com'];
      if (!strong(body['password'] ?? ''))
        errors['password'] = ['Use at least 10 characters, a number or a symbol'];
      else if (body['password'] === 'password123!')
        errors['password'] = ['Choose a password that hasn’t appeared in a data breach'];
      if (!/^[ML]\d[A-Z] ?\d[A-Z]\d$/i.test(body['postalCode']?.trim() ?? ''))
        errors['postalCode'] = ['Enter a postal code in the GTA, like M4M 1H1'];
      if (Object.keys(errors).length) return problem(400, 'Some details need fixing.', { errors });
      const email = body['email'].trim().toLowerCase();
      if (this.registered.has(email))
        return problem(409, 'There’s already a Giddy account for that email');
      this.registered.add(email);
      return { status: 201, body: { email } };
    });
    on('POST', '/api/auth/verify', (request) => {
      const { token } = request.postDataJSON() as { token: string };
      const last = this.signUps.at(-1);
      if (token !== 'good-token')
        return problem(410, 'This confirmation link has expired', {
          email: (last?.['email'] as string) ?? amara.email,
        });
      const name = (last?.['firstName'] as string) ?? 'Rania';
      this.setSession({
        parentId: 'a0000000-0000-4000-8000-00000000000a',
        name,
        email: (last?.['email'] as string) ?? 'rania@example.com',
        emailVerified: true,
        emailBounced: false,
      });
      return { body: { name } };
    });
    on('POST', '/api/auth/verify/resend', () => {
      if (this.resendWaitSeconds !== null)
        return problem(429, `You can send another link in ${this.resendWaitSeconds} seconds`, {
          retryAfterSeconds: this.resendWaitSeconds,
        });
      this.resends++;
      return { status: 202 };
    });
    on('POST', '/api/auth/sign-in', (request) => {
      const body = request.postDataJSON() as { email: string; password: string };
      this.signIns.push(body);
      if (body.email === 'paused@example.com')
        return problem(423, 'Sign-in is paused for 15 minutes to keep your account safe', {
          detail: 'Try again later, or reset your password to sign in now.',
        });
      if (body.email.trim().toLowerCase() !== amara.email || body.password !== demoPassword)
        return problem(401, 'That email and password don’t match', {
          detail:
            'Check for typos, or reset your password. After 5 tries we pause sign-in for 15 minutes to keep your account safe.',
        });
      this.setSession({ ...amara });
      return { body: { name: amara.name } };
    });
    on('POST', '/api/auth/sign-out', () => {
      this.setSession(null);
      return { status: 204 };
    });
    on('POST', '/api/auth/password/forgot', (request) => {
      const { email } = request.postDataJSON() as { email: string };
      if (!isEmail(email ?? ''))
        return problem(400, 'Some details need fixing.', {
          errors: { email: ['Enter an email address like name@example.com'] },
        });
      if (this.emailDown)
        return problem(502, 'We couldn’t send the email just now', {
          detail:
            'Our email service didn’t respond. Your request wasn’t sent; try again in a moment.',
        });
      return { status: 202 };
    });
    on('GET', '/api/auth/password/reset/:token', (_, { token }) =>
      token === 'reset-token'
        ? { body: { email: amara.email } }
        : problem(410, 'This link has expired'),
    );
    on('POST', '/api/auth/password/reset', (request) => {
      const body = request.postDataJSON() as { token: string; password: string; confirm: string };
      if (body.token !== 'reset-token') return problem(410, 'This link has expired');
      const errors: Record<string, string[]> = {};
      if (!strong(body.password))
        errors['password'] = ['Use at least 10 characters, a number or a symbol'];
      if (body.confirm !== body.password) errors['confirm'] = ['Passwords don’t match'];
      if (Object.keys(errors).length) return problem(400, 'Some details need fixing.', { errors });
      this.setSession({ ...amara });
      return { body: { name: amara.name } };
    });
    on('GET', '/api/auth/external/:provider', () => {
      if (this.provider === 'error')
        return { status: 302, headers: { location: '/sign-in?error=provider' } };
      this.setSession(
        this.provider === 'new'
          ? {
              parentId: 'a0000000-0000-4000-8000-00000000000b',
              name: 'Kofi',
              email: 'kofi.mensah@example.com',
              emailVerified: true,
              emailBounced: false,
            }
          : { ...amara },
      );
      return { status: 302, headers: { location: this.provider === 'new' ? '/welcome' : '/' } };
    });
  }
}
