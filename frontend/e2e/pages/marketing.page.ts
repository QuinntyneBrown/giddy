import { Locator, Page, Request } from '@playwright/test';

/** The marketing site runs as its own application beside the app (L2-095). */
export const MARKETING_ORIGIN = 'http://127.0.0.1:4300';
/** The app the site links into, from the site's development environment. */
export const APP_ORIGIN = 'http://127.0.0.1:4200';

export class MarketingPage {
  readonly body: Locator;
  readonly main: Locator;
  readonly heroHeading: Locator;
  readonly header: Locator;
  readonly logoLink: Locator;
  readonly sectionNavigation: Locator;
  readonly hero: Locator;
  private readonly apiRequests: string[] = [];

  constructor(private readonly page: Page) {
    this.body = page.locator('body');
    this.main = page.locator('main#main');
    this.heroHeading = page.getByRole('heading', { level: 1 });
    this.header = page.getByRole('banner');
    this.logoLink = this.header.getByRole('link', { name: 'Giddy, back to the top' });
    this.sectionNavigation = page.getByRole('navigation', { name: 'Page sections' });
    this.hero = page.getByRole('region', { name: 'Parties they’ll flip for.' });
    page.on('request', (request: Request) => {
      if (new URL(request.url()).pathname.startsWith('/api/')) this.apiRequests.push(request.url());
    });
  }

  async open(path = '/'): Promise<void> {
    await this.page.goto(new URL(path, MARKETING_ORIGIN).href);
    await this.heroHeading.waitFor();
  }

  async useWidth(width: number): Promise<void> {
    await this.page.setViewportSize({ width, height: 800 });
  }

  /** A link in the header by its name, such as "Sign in". */
  headerLink(name: string): Locator {
    return this.header.getByRole('link', { name, exact: true });
  }

  /** The names and addresses of the section links, in order. */
  async sectionLinks(): Promise<{ name: string; href: string | null }[]> {
    const links = await this.sectionNavigation.getByRole('link').all();
    return Promise.all(
      links.map(async (link) => ({
        name: (await link.textContent())?.trim() ?? '',
        href: await link.getAttribute('href'),
      })),
    );
  }

  heroLink(name: string): Locator {
    return this.hero.getByRole('link', { name, exact: true });
  }

  heroText(text: string): Locator {
    return this.hero.getByText(text, { exact: true });
  }

  /** Every request the site made to the Giddy API; the site must make none. */
  requestsToApi(): string[] {
    return [...this.apiRequests];
  }
}
