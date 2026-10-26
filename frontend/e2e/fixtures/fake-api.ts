import { Page, Request, Route } from '@playwright/test';
import { FakePlanner } from './fake-planner';
import { amara, dinoParty, SeedParty, SeedSession, xsrfToken } from './seed-data';

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
  parties: SeedParty[] = [{ ...dinoParty }];
  readonly planner = new FakePlanner();

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
    this.on('GET', '/api/parties', () => ({ body: this.parties }));
    this.planner.register((method, path, handler) => this.on(method, path, handler));
    this.on('GET', '/api/antiforgery', () =>
      this.session
        ? {
            body: { token: xsrfToken },
            headers: { 'set-cookie': `XSRF-TOKEN=${xsrfToken}; Path=/; SameSite=Strict` },
          }
        : { status: 401, body: problem(401, 'Sign in to continue.') },
    );
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

    if (!['GET', 'HEAD', 'OPTIONS'].includes(request.method())) {
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
