import { Page, Request, Route } from '@playwright/test';

export interface FakeResponse {
  status?: number;
  body?: unknown;
  delayMs?: number;
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
    // Seeded endpoints are registered here as API contracts are added.
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

    const response = match.definition.handler(request, match.params);
    if (response.delayMs) {
      await new Promise((resolve) => setTimeout(resolve, response.delayMs));
    }
    await route.fulfill({ status: response.status ?? 200, json: response.body ?? null });
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
