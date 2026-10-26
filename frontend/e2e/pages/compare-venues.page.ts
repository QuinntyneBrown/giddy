import { Locator, Page } from '@playwright/test';
import { AppShellPage } from './app-shell.page';

export class CompareVenuesPage extends AppShellPage {
  readonly heading: Locator;
  readonly pick: Locator;
  readonly table: Locator;
  readonly empty: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', { level: 1, name: 'Compare venues' });
    this.pick = page.getByRole('status').filter({ hasText: 'Giddy’s pick' });
    this.table = page.getByRole('table');
    this.empty = page.getByRole('region', { name: 'Pick 2 or 3 venues to compare' });
  }

  async openComparison(query: string): Promise<void> {
    await this.open(`/venues/compare${query}`);
  }

  row(label: string): Locator {
    return this.table
      .getByRole('row')
      .filter({ has: this.page.getByRole('rowheader', { name: label }) });
  }

  columnHeaders(): Promise<string[]> {
    return this.table.getByRole('columnheader').allInnerTexts();
  }
}
