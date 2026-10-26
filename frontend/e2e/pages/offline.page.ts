import { Locator, Page } from '@playwright/test';

/** What a page that isn't saved on the device shows while offline. */
export class OfflinePage {
  readonly heading: Locator;
  readonly openRunSheet: Locator;
  readonly tryAgain: Locator;

  constructor(page: Page) {
    this.heading = page.getByRole('heading', { level: 1, name: 'No internet right now' });
    this.openRunSheet = page.getByRole('link', { name: 'Open saved run sheet' });
    this.tryAgain = page.getByRole('button', { name: 'Try again' });
  }
}
