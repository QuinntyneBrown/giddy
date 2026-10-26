import { Locator, Page } from '@playwright/test';
import { AppShellPage } from './app-shell.page';

/** Party themes: filters for the child, and choosing one for the party. */
export class ThemesPage extends AppShellPage {
  readonly heading: Locator;
  readonly subtitle: Locator;
  readonly filters: Locator;
  readonly results: Locator;
  readonly emptyState: Locator;
  readonly toasts: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', { level: 1, name: 'Party themes' });
    this.subtitle = page.locator('.page-header .subtitle');
    this.filters = page.getByRole('group', { name: 'Filter themes' });
    this.results = page.getByRole('list', { name: 'Themes' }).getByRole('listitem');
    this.emptyState = page.locator('[giddy-empty-state]');
    this.toasts = page.locator('giddy-toast');
  }

  async openThemes(): Promise<void> {
    await this.open('/themes');
  }

  chip(name: string): Locator {
    return this.filters.getByRole('button', { name, exact: true });
  }

  theme(name: string): Locator {
    return this.results.filter({ has: this.page.getByRole('heading', { name, exact: true }) });
  }

  async use(name: string): Promise<void> {
    await this.theme(name).getByRole('button', { name: 'Use this theme' }).click();
  }

  async names(): Promise<string[]> {
    await this.results.first().waitFor();
    return this.results.getByRole('heading').allInnerTexts();
  }

  toast(title: string): Locator {
    return this.toasts.filter({ hasText: title });
  }
}
