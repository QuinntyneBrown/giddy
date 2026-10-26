import { Locator, Page } from '@playwright/test';

/** The banners about the connection and changes made on this device while offline. */
export class SyncBanner {
  readonly offline: Locator;
  readonly backOnline: Locator;
  readonly conflict: Locator;
  readonly reviewChange: Locator;

  constructor(page: Page) {
    const banners = page.locator('.offline-banner');
    this.offline = banners.locator('[giddy-alert]').filter({ hasText: 'You’re offline' });
    this.backOnline = banners.locator('[giddy-alert]').filter({ hasText: 'Back online' });
    this.conflict = banners.locator('[giddy-alert]').filter({ hasText: 'couldn’t sync' });
    this.reviewChange = this.conflict.getByRole('button', { name: 'Review change' });
  }
}
