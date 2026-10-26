import { Locator, Page } from '@playwright/test';
import { AppShellPage } from './app-shell.page';

/** Venues: filters, sort, result tiles and the compare bar. */
export class VenuesPage extends AppShellPage {
  readonly heading: Locator;
  readonly subtitle: Locator;
  readonly date: Locator;
  readonly kids: Locator;
  readonly near: Locator;
  readonly maxPrice: Locator;
  readonly sort: Locator;
  readonly results: Locator;
  readonly noResults: Locator;
  readonly error: Locator;
  readonly outsideArea: Locator;
  readonly compareBar: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', { level: 1, name: 'Venues' });
    this.subtitle = this.main.locator('.page-header .subtitle');
    this.date = page.getByLabel('Date', { exact: true });
    this.kids = page.getByLabel('Kids', { exact: true });
    this.near = page.getByLabel('Near', { exact: true });
    this.maxPrice = page.getByLabel('Max price', { exact: true });
    this.sort = page.getByLabel('Sort', { exact: true });
    this.results = page.getByRole('list', { name: 'Venues' }).getByRole('listitem');
    this.noResults = page.getByRole('region').filter({ has: page.locator('.empty__title') });
    this.error = page.getByRole('alert').filter({ hasText: 'We couldn’t check availability' });
    this.outsideArea = page.getByRole('region', { name: 'Giddy covers the GTA for now' });
    this.compareBar = page.getByRole('status').filter({ hasText: /selected|up to 3/ });
  }

  async openVenues(query = ''): Promise<void> {
    await this.open(`/venues${query}`);
  }

  result(name: string): Locator {
    return this.results.filter({ has: this.page.getByRole('heading', { name }) });
  }

  resultNames(): Promise<string[]> {
    return this.results.getByRole('heading').allInnerTexts();
  }

  async toggleFilter(name: 'Indoor' | 'Nut-free kitchen' | 'Parking' | 'Step-free'): Promise<void> {
    await this.page.getByRole('button', { name, exact: true }).click();
  }

  filterChip(name: string): Locator {
    return this.page.getByRole('button', { name, exact: true });
  }

  async compare(name: string): Promise<void> {
    await this.result(name)
      .getByRole('checkbox', { name: /Compare/ })
      .check();
  }

  /** Ticks Compare even when the page will refuse it. */
  async tryToCompare(name: string): Promise<void> {
    await this.result(name)
      .getByRole('checkbox', { name: /Compare/ })
      .click();
  }

  compareBox(name: string): Locator {
    return this.result(name).getByRole('checkbox', { name: /Compare/ });
  }

  async openComparison(): Promise<void> {
    await this.compareBar.getByRole('link', { name: 'Compare' }).click();
  }

  async relax(label: string): Promise<void> {
    await this.noResults.getByRole('button', { name: label }).click();
  }

  async tryAgain(): Promise<void> {
    await this.error.getByRole('button', { name: 'Try again' }).click();
  }
}
