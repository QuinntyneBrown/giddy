import { Locator, Page } from '@playwright/test';
import { AppShellPage } from './app-shell.page';

/** The family: each child with their next birthday, interests and party. */
export class FamilyPage extends AppShellPage {
  readonly heading: Locator;
  readonly subtitle: Locator;
  readonly addChild: Locator;
  readonly emptyState: Locator;
  readonly toasts: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', { level: 1, name: 'Family' });
    this.subtitle = page.locator('.page-header .subtitle');
    this.addChild = page.locator('.page-header').getByRole('button', { name: 'Add a child' });
    this.emptyState = page.locator('[giddy-empty-state]');
    this.toasts = page.locator('giddy-toast');
  }

  async openFamily(): Promise<void> {
    await this.open('/family');
  }

  child(name: string): Locator {
    return this.page.getByRole('region', { name, exact: true });
  }

  edit(name: string): Locator {
    return this.child(name).getByRole('button', { name: `Edit ${name}` });
  }
}
