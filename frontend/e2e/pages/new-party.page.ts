import { Locator, Page } from '@playwright/test';
import { AppShellPage } from './app-shell.page';

/** Plan a new party: the basics form. */
export class NewPartyPage extends AppShellPage {
  readonly heading: Locator;
  readonly date: Locator;
  readonly guests: Locator;
  readonly budget: Locator;
  readonly near: Locator;
  readonly childName: Locator;
  readonly turningAge: Locator;
  readonly errorSummary: Locator;
  readonly submitError: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', { level: 1, name: 'Plan a new party' });
    this.date = page.getByLabel('Party date');
    this.guests = page.getByLabel('How many kids?');
    this.budget = page.getByLabel('Budget');
    this.near = page.getByLabel('Postal code');
    this.childName = page.getByLabel('Their first name');
    this.turningAge = page.getByLabel('Age they’re turning');
    this.errorSummary = page.getByRole('alert').filter({ hasText: 'Let’s fix' });
    this.submitError = page.getByRole('alert').filter({ hasText: 'didn’t save' });
  }

  async openNew(query = ''): Promise<void> {
    await this.open(`/parties/new${query}`);
  }

  child(name: string): Locator {
    return this.page.getByRole('radio', { name: new RegExp(`^${name}`) });
  }

  timeOfDay(name: 'Morning' | 'Afternoon' | 'Evening'): Locator {
    return this.page.getByRole('radio', { name: new RegExp(`^${name}`) });
  }

  help(field: Locator): Promise<string> {
    return field.evaluate((el) =>
      (el.getAttribute('aria-describedby') ?? '')
        .split(' ')
        .map((id) => document.getElementById(id)?.textContent?.trim() ?? '')
        .join(' '),
    );
  }

  summaryLink(text: string): Locator {
    return this.errorSummary.getByRole('link', { name: text });
  }

  async submit(): Promise<void> {
    await this.page.getByRole('button', { name: 'Plan it with Giddy' }).click();
  }

  path(): string {
    return new URL(this.page.url()).pathname;
  }
}
