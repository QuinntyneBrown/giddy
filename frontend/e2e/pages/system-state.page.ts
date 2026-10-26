import { Locator, Page } from '@playwright/test';
import { AppShellPage } from './app-shell.page';

export class SystemStatePage extends AppShellPage {
  constructor(page: Page) {
    super(page);
  }

  heading(name: string): Locator {
    return this.page.getByRole('heading', { name });
  }

  link(name: string): Locator {
    return this.page.getByRole('link', { name });
  }

  title(): Promise<string> {
    return this.page.title();
  }
}
