import { Locator, Page } from '@playwright/test';
import { AppShellPage } from './app-shell.page';

/** A party's budget: totals, spend by category, every cost, and getting back within budget. */
export class BudgetPage extends AppShellPage {
  readonly heading: Locator;
  readonly subtitle: Locator;
  readonly sections: Locator;
  readonly summary: Locator;
  readonly status: Locator;
  readonly meter: Locator;
  readonly legend: Locator;
  readonly table: Locator;
  readonly totals: Locator;
  readonly taxNote: Locator;
  readonly addCost: Locator;
  readonly overBudget: Locator;
  readonly talkItThrough: Locator;
  readonly emptyState: Locator;
  readonly loading: Locator;
  readonly toasts: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', { level: 1, name: 'Budget' });
    this.subtitle = page.locator('.page-header .subtitle');
    this.sections = page.getByRole('navigation', { name: 'Party sections' });
    this.summary = page.getByRole('region', { name: 'Planned spend' });
    this.status = this.summary.locator('giddy-badge');
    this.meter = this.summary.getByRole('img');
    this.legend = this.summary.getByRole('list');
    this.table = page.getByRole('table', { name: 'Party costs' });
    this.totals = this.table.locator('tfoot tr');
    this.taxNote = page.getByText('All prices include 13% HST');
    this.addCost = page.locator('.page-header').getByRole('button', { name: 'Add a cost' });
    this.overBudget = page.locator('[giddy-alert]').filter({ hasText: 'over budget' });
    this.talkItThrough = this.overBudget.getByRole('link', { name: 'Talk it through' });
    this.emptyState = page.locator('[giddy-empty-state]');
    this.loading = page.getByText('Loading the budget…');
    this.toasts = page.locator('giddy-toast');
  }

  async openBudget(partyId: string): Promise<void> {
    await this.open(`/parties/${partyId}/budget`);
  }

  stat(label: string): Locator {
    return this.summary.locator('giddy-stat').filter({ hasText: label });
  }

  row(name: string): Locator {
    return this.table.locator('tbody tr').filter({ hasText: name });
  }

  rows(): Locator {
    return this.table.locator('tbody tr');
  }

  edit(name: string): Locator {
    return this.row(name).getByRole('button', { name: `Edit ${name}` });
  }

  swap(name: string): Locator {
    return this.overBudget.getByRole('button', { name: `Swap ${name}` });
  }

  toast(heading: string): Locator {
    return this.toasts.filter({ hasText: heading });
  }
}
