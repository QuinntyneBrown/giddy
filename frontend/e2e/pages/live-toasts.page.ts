import { Locator, Page } from '@playwright/test';

/** Toasts about replies, allergies and bounces, shown on any page while Giddy is open. */
export class LiveToasts {
  readonly region: Locator;

  constructor(private readonly page: Page) {
    this.region = page.locator('giddy-live-rsvp-toasts');
  }

  toast(title: string): Locator {
    return this.region.locator('giddy-toast').filter({ hasText: title });
  }

  async act(title: string, action: string): Promise<void> {
    await this.toast(title)
      .getByRole('link', { name: action })
      .or(this.toast(title).getByRole('button', { name: action }))
      .click();
  }
}
