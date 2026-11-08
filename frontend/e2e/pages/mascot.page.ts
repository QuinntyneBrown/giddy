import { Locator, Page } from '@playwright/test';

/** Giddy the balloon wherever a screen shows it (L2-097). Open the screen with its own page object. */
export class MascotPage {
  constructor(private readonly page: Page) {}

  /** Giddy as an image with this accessible name. */
  named(name: string): Locator {
    return this.page.getByRole('img', { name, exact: true });
  }

  async preferColourScheme(colorScheme: 'dark' | 'light'): Promise<void> {
    await this.page.emulateMedia({ colorScheme });
  }

  /** The computed colours of Giddy's balloon and face, as `rgb(...)`. */
  async colours(mascot: Locator): Promise<{ balloon: string; face: string }> {
    return mascot.evaluate((svg) => ({
      balloon: getComputedStyle(svg.querySelector('.balloon')!).fill,
      face: getComputedStyle(svg.querySelector('.face')!).fill,
    }));
  }
}
