import { Request } from '@playwright/test';
import { FakeResponse } from './fake-planner';
import { amara, SeedSession } from './seed-data';

type Register = (
  method: string,
  path: string,
  handler: (request: Request, params: Record<string, string>) => FakeResponse,
) => void;

interface Channels {
  email: boolean;
  text: boolean;
  push: boolean;
}

const problem = (errors: Record<string, string[]>) => ({
  status: 400,
  body: { status: 400, title: 'Some details need fixing.', errors },
});

/** Settings and privacy, as the API answers them. */
export class FakeSettings {
  settings = {
    firstName: 'Amara',
    lastName: 'Okafor' as string | null,
    email: amara.email,
    pendingEmail: null as string | null,
    mobile: '416-555-0131' as string | null,
    postalCode: 'M4M 1H1' as string | null,
    quietHours: true,
    notifications: {
      rsvps: { email: true, text: true, push: true },
      vendors: { email: true, text: false, push: true },
      reminders: { email: true, text: true, push: false },
      ideas: { email: false, text: false, push: false },
    } as Record<string, Channels>,
  };
  /** Bodies of PUT /api/settings/quiet-hours, oldest first. */
  quietHoursChanges: boolean[] = [];
  exports = 0;
  liveBookings = 1;
  deleted = false;

  constructor(private readonly setSession: (session: SeedSession | null) => void) {}

  register(on: Register): void {
    on('GET', '/api/settings', () => ({ body: this.settings }));
    on('PUT', '/api/settings/profile', (request) => {
      const body = request.postDataJSON() as Record<string, string | null>;
      const errors: Record<string, string[]> = {};
      if (!body['firstName']?.trim()) errors['firstName'] = ['Enter your first name'];
      if (body['mobile'] && !/^\(?\d{3}\)?[ .-]?\d{3}[ .-]?\d{4}$/.test(body['mobile']))
        errors['mobile'] = ['Enter a Canadian mobile number, like 416-555-0131, or leave it blank'];
      if (body['postalCode'] && !/^[A-Za-z]\d[A-Za-z] ?\d[A-Za-z]\d$/.test(body['postalCode']))
        errors['postalCode'] = ['Enter a Canadian postal code, like M4M 1H1'];
      if (Object.keys(errors).length) return problem(errors);
      Object.assign(this.settings, {
        firstName: body['firstName']!.trim(),
        lastName: body['lastName'] || null,
        mobile: body['mobile'] || null,
        postalCode: body['postalCode']?.toUpperCase() || null,
      });
      return { body: this.settings };
    });
    on('POST', '/api/settings/email', (request) => {
      const { email } = request.postDataJSON() as { email: string };
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email ?? ''))
        return problem({ email: ['Enter an email address like name@example.com'] });
      this.settings.pendingEmail = email.trim().toLowerCase();
      return { status: 202 };
    });
    on('PUT', '/api/settings/quiet-hours', (request) => {
      const { on: value } = request.postDataJSON() as { on: boolean };
      this.quietHoursChanges.push(value);
      this.settings.quietHours = value;
      return { body: this.settings };
    });
    on('PUT', '/api/settings/notifications', (request) => {
      this.settings.notifications = request.postDataJSON() as Record<string, Channels>;
      return { body: this.settings };
    });
    on('POST', '/api/privacy/export', () => {
      this.exports++;
      return { status: 202 };
    });
    on('GET', '/api/privacy/deletion-check', () => ({ body: { liveBookings: this.liveBookings } }));
    on('POST', '/api/privacy/delete-account', (request) => {
      const { email } = request.postDataJSON() as { email: string };
      if ((email ?? '').trim().toLowerCase() !== this.settings.email)
        return problem({ email: [`Type the email you sign in with, ${this.settings.email}`] });
      this.deleted = true;
      this.setSession(null);
      return { status: 204 };
    });
  }
}
