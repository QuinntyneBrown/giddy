import { Page } from '@playwright/test';

/** One icon a page declares in its head, and what the server answers for it. */
export interface SiteIcon {
  rel: string;
  href: string;
  type: string | null;
  sizes: string | null;
  status: number;
  contentType: string;
}

/** The icons a page declares for the browser tab and the home screen (L2-096 AC4). */
export class SiteIconsPage {
  constructor(private readonly page: Page) {}

  async open(url: string): Promise<void> {
    await this.page.goto(url);
  }

  /** Every `icon` and `apple-touch-icon` link in the head, each fetched from the server. */
  async declaredIcons(): Promise<SiteIcon[]> {
    const links = await this.page
      .locator('head link[rel="icon"], head link[rel="apple-touch-icon"]')
      .evaluateAll((elements) =>
        elements.map((link) => ({
          rel: link.getAttribute('rel') ?? '',
          href: (link as HTMLLinkElement).href,
          type: link.getAttribute('type'),
          sizes: link.getAttribute('sizes'),
        })),
      );
    return Promise.all(
      links.map(async (link) => {
        const response = await this.page.request.get(link.href);
        return {
          ...link,
          href: new URL(link.href).pathname,
          status: response.status(),
          contentType: response.headers()['content-type'] ?? '',
        };
      }),
    );
  }
}
