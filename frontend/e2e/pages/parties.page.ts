import { Locator, Page } from '@playwright/test';
import { AppShellPage } from './app-shell.page';

/** My parties. */
export class PartiesPage extends AppShellPage {
  readonly heading: Locator;
  readonly subtitle: Locator;
  readonly upcoming: Locator;
  readonly drafts: Locator;
  readonly past: Locator;
  readonly empty: Locator;
  readonly error: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', { level: 1, name: 'My parties' });
    this.subtitle = this.main.locator('.page-header .subtitle');
    this.upcoming = page.getByRole('region', { name: 'Upcoming' });
    this.drafts = page.getByRole('region', { name: 'Drafts' });
    this.past = page.getByRole('region', { name: 'Past parties' });
    this.empty = page.getByRole('region', { name: 'No parties yet' });
    this.error = page.getByRole('alert').filter({ hasText: 'We couldn’t load your parties' });
  }

  async openList(): Promise<void> {
    await this.open('/parties');
  }

  partyLink(section: Locator, name: string): Locator {
    return section.getByRole('link', { name: new RegExp(name) });
  }

  async tryAgain(): Promise<void> {
    await this.error.getByRole('button', { name: 'Try again' }).click();
  }
}
