import { Page, Request, Route } from '@playwright/test';
import { FakeBookings } from './fake-bookings';
import { FakeAccounts } from './fake-accounts';
import { FakeBudget } from './fake-budget';
import { FakeChecklist } from './fake-checklist';
import { FakeFamily } from './fake-family';
import { FakeNotifications } from './fake-notifications';
import { FakeSharing } from './fake-sharing';
import { FakeSettings } from './fake-settings';
import { FakeRunSheet } from './fake-run-sheet';
import { FakeGuests } from './fake-guests';
import { FakeParties } from './fake-parties';
import { FakePlanner } from './fake-planner';
import { FakeThemes } from './fake-themes';
import { FakeVendors } from './fake-vendors';
import { FakeVenues } from './fake-venues';
import { amara, SeedSession, xsrfToken } from './seed-data';

export interface FakeResponse {
  status?: number;
  body?: unknown;
  delayMs?: number;
  headers?: Record<string, string>;
}

type Handler = (request: Request, params: Record<string, string>) => FakeResponse;

interface RouteDefinition {
  method: string;
  pattern: RegExp;
  keys: string[];
  handler: Handler;
}

/**
 * Answers every API call the web app makes with seeded in-memory data that follows the real
 * API contracts. Requests nobody handles are recorded and fail the test loudly.
 */
export class FakeApi {
  private readonly routes: RouteDefinition[] = [];
  private readonly overrides: RouteDefinition[] = [];
  readonly unrouted: string[] = [];
  session: SeedSession | null = { ...amara };
  readonly planner = new FakePlanner();
  readonly partyStore = new FakeParties();
  readonly venueStore = new FakeVenues();
  readonly bookingStore = new FakeBookings(() => this.venueStore.venues);
  readonly guestStore = new FakeGuests(() => this.session);
  readonly themeStore = new FakeThemes();
  readonly vendorStore = new FakeVendors(
    () =>
      this.guestStore.guests
        .filter((g) => g.allergies && g.rsvp !== 'cantCome')
        .map((g) => ({ child: g.childName.split(' ')[0], note: g.allergies! })),
    (name) => {
      const booking = this.partyStore.bookings.find((b) => b.name === name);
      if (!booking) return null;
      return (
        {
          toBook: 'inYourPlan',
          quoteRequested: 'quoteRequested',
          quoted: 'quoteReceived',
          confirmed: 'booked',
        } as Record<string, string>
      )[booking.status];
    },
    (vendor) => {
      const existing = this.partyStore.bookings.find((b) => b.name === vendor.name);
      if (existing) existing.status = 'quoteRequested';
      else
        this.partyStore.bookings.push({
          category: vendor.planCategory,
          name: vendor.name,
          price: vendor.price,
          status: 'quoteRequested',
          paid: 0,
          quoteExpiresOn: null,
        });
    },
  );

  readonly budgetStore = new FakeBudget(
    (partyId) => {
      const party = this.partyStore.parties.find((p) => p.id === partyId);
      return party ? { budget: party.budget, guests: party.guests, status: party.status } : null;
    },
    () => this.partyStore.bookings,
    () => this.vendorStore.vendors,
  );

  readonly checklistStore = new FakeChecklist(
    (partyId) => {
      const party = this.partyStore.parties.find((p) => p.id === partyId);
      return party ? { date: party.date, status: party.status } : null;
    },
    () => this.guestStore.guests.filter((g) => g.rsvp === 'waiting').length,
    () =>
      this.partyStore.bookings.find((b) => b.category === 'Venue' && b.status === 'confirmed')
        ?.name ?? null,
  );

  readonly runSheetStore = new FakeRunSheet(
    (partyId) => {
      const party = this.partyStore.parties.find((p) => p.id === partyId);
      return party
        ? { date: party.date, startsAt: party.startsAt, endsAt: party.endsAt, status: party.status }
        : null;
    },
    () =>
      this.guestStore.guests
        .filter((g) => g.allergies && g.rsvp !== 'cantCome')
        .map((g) => ({ child: g.childName.split(' ')[0], allergy: g.allergies! }))
        .sort((a, b) => a.child.localeCompare(b.child)),
    () => this.guestStore.guests.filter((g) => g.rsvp === 'coming').length,
  );

  readonly accountStore = new FakeAccounts((session) => {
    this.session = session;
    this.sessionExpired = false;
  });
  readonly familyStore = new FakeFamily(() => this.partyStore.family.children);
  readonly notificationStore = new FakeNotifications();
  readonly sharingStore = new FakeSharing();
  readonly settingsStore = new FakeSettings((session) => (this.session = session));
  /** When set, the session has expired: everything but sign-in answers 401. */
  sessionExpired = false;

  constructor() {
    this.registerDefaults();
  }

  /** Replace the answer for one endpoint, for example to simulate a failure or a delay. */
  respond(method: string, path: string, response: FakeResponse | Handler): void {
    const handler: Handler = typeof response === 'function' ? response : () => response;
    this.overrides.unshift(this.define(method, path, handler));
  }

  async install(page: Page): Promise<void> {
    await page.route('**/api/**', (route) => this.handle(route));
  }

  private registerDefaults(): void {
    this.on('GET', '/api/session', () =>
      this.session
        ? { body: this.session }
        : { status: 401, body: problem(401, 'Sign in to continue.') },
    );
    this.planner.register((method, path, handler) => this.on(method, path, handler));
    this.venueStore.register((method, path, handler) => this.on(method, path, handler));
    this.venueStore.liveBooking = (partyId, venueId) =>
      this.bookingStore.liveBooking(partyId, venueId);
    this.bookingStore.register((method, path, handler) => this.on(method, path, handler));
    this.guestStore.register((method, path, handler) => this.on(method, path, handler));
    this.vendorStore.register((method, path, handler) => this.on(method, path, handler));
    this.themeStore.register((method, path, handler) => this.on(method, path, handler));
    this.budgetStore.register((method, path, handler) => this.on(method, path, handler));
    this.checklistStore.register((method, path, handler) => this.on(method, path, handler));
    this.runSheetStore.register((method, path, handler) => this.on(method, path, handler));
    this.accountStore.register((method, path, handler) => this.on(method, path, handler));
    this.familyStore.register((method, path, handler) => this.on(method, path, handler));
    this.notificationStore.register((method, path, handler) => this.on(method, path, handler));
    this.sharingStore.register((method, path, handler) => this.on(method, path, handler));
    this.settingsStore.register((method, path, handler) => this.on(method, path, handler));
    this.partyStore.register(
      (method, path, handler) => this.on(method, path, handler),
      (partyId) => this.planner.startFor(partyId),
    );
    // Like the API, visitors get a token too, so signing in and up are protected.
    this.on('GET', '/api/antiforgery', () => ({
      body: { token: xsrfToken },
      headers: { 'set-cookie': `XSRF-TOKEN=${xsrfToken}; Path=/; SameSite=Strict` },
    }));
  }

  private async handle(route: Route): Promise<void> {
    const request = route.request();
    const url = new URL(request.url());
    const match = this.find(request.method(), url.pathname);

    if (!match) {
      this.unrouted.push(`${request.method()} ${url.pathname}`);
      await route.fulfill({ status: 599, json: { title: 'Unrouted request in the fake API' } });
      return;
    }

    if (
      this.sessionExpired &&
      !url.pathname.startsWith('/api/auth/') &&
      url.pathname !== '/api/antiforgery'
    ) {
      await route.fulfill({ status: 401, json: problem(401, 'Sign in to continue.') });
      return;
    }

    // Like the API, private RSVP links are exempt: they carry their credential in the path.
    if (
      !['GET', 'HEAD', 'OPTIONS'].includes(request.method()) &&
      !url.pathname.startsWith('/api/rsvp/')
    ) {
      const token = await request.headerValue('x-xsrf-token');
      if (token !== xsrfToken) {
        await route.fulfill({ status: 400, json: problem(400, 'Missing anti-forgery token.') });
        return;
      }
    }

    const response = match.definition.handler(request, match.params);
    if (response.delayMs) {
      await new Promise((resolve) => setTimeout(resolve, response.delayMs));
    }
    await route.fulfill({
      status: response.status ?? 200,
      json: response.body ?? null,
      headers: response.headers,
    });
  }

  private find(method: string, path: string) {
    for (const definition of [...this.overrides, ...this.routes]) {
      if (definition.method !== method) continue;
      const result = definition.pattern.exec(path);
      if (!result) continue;
      const params = Object.fromEntries(definition.keys.map((key, i) => [key, result[i + 1]]));
      return { definition, params };
    }
    return undefined;
  }

  private on(method: string, path: string, handler: Handler): void {
    this.routes.push(this.define(method, path, handler));
  }

  private define(method: string, path: string, handler: Handler): RouteDefinition {
    const keys: string[] = [];
    const source = path.replace(/:([a-zA-Z]+)/g, (_, key: string) => {
      keys.push(key);
      return '([^/]+)';
    });
    return { method, pattern: new RegExp(`^${source}$`), keys, handler };
  }
}

export function problem(status: number, title: string, extensions: Record<string, unknown> = {}) {
  return { status, title, ...extensions };
}
