import { Locator, Page } from '@playwright/test';
import { AppShellPage } from './app-shell.page';

/** Fun & food: entertainers, activities, food and cake, and rentals for the party. */
export class VendorsPage extends AppShellPage {
  readonly heading: Locator;
  readonly subtitle: Locator;
  readonly filters: Locator;
  readonly results: Locator;
  readonly allergyAlert: Locator;
  readonly emptyState: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', { level: 1, name: 'Fun & food' });
    this.subtitle = page.locator('.page-header .subtitle');
    this.filters = page.getByRole('group', { name: 'Filter vendors' });
    this.results = page.getByRole('list', { name: 'Vendors' }).getByRole('listitem');
    this.allergyAlert = page.locator('.alert--warning');
    this.emptyState = page.locator('[giddy-empty-state]');
  }

  async openVendors(query = ''): Promise<void> {
    await this.open(`/vendors${query}`);
  }

  chip(name: string): Locator {
    return this.filters.getByRole('button', { name, exact: true });
  }

  result(name: string): Locator {
    return this.results.filter({ has: this.page.getByRole('heading', { name, exact: true }) });
  }

  async requestQuote(name: string): Promise<void> {
    await this.result(name).getByRole('button', { name: 'Request a quote' }).click();
  }

  async names(): Promise<string[]> {
    await this.results.first().waitFor();
    return this.results.getByRole('heading').allInnerTexts();
  }
}
