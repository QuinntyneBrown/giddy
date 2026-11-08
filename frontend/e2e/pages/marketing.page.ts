import { Locator, Page, Request } from '@playwright/test';

/** The marketing site runs as its own application beside the app (L2-095). */
export const MARKETING_ORIGIN = 'http://127.0.0.1:4300';
/** The app the site links into, from the site's development environment. */
export const APP_ORIGIN = 'http://127.0.0.1:4200';

export class MarketingPage {
  readonly body: Locator;
  readonly main: Locator;
  readonly heroHeading: Locator;
  private readonly apiRequests: string[] = [];

  constructor(private readonly page: Page) {
    this.body = page.locator('body');
    this.main = page.locator('main#main');
    this.heroHeading = page.getByRole('heading', { level: 1 });
    page.on('request', (request: Request) => {
      if (new URL(request.url()).pathname.startsWith('/api/')) this.apiRequests.push(request.url());
    });
  }

  async open(path = '/'): Promise<void> {
    await this.page.goto(new URL(path, MARKETING_ORIGIN).href);
    await this.heroHeading.waitFor();
  }

  /** Every request the site made to the Giddy API; the site must make none. */
  requestsToApi(): string[] {
    return [...this.apiRequests];
  }
}
