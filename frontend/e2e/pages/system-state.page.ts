import { Locator, Page } from '@playwright/test';
import { AppShellPage } from './app-shell.page';

/** The 404, 403, 500 and offline pages. */
export class SystemStatePage extends AppShellPage {
  constructor(page: Page) {
    super(page);
  }

  heading(name: string): Locator {
    return this.page.getByRole('heading', { level: 1, name });
  }

  code(): Locator {
    return this.main.locator('.status-page__code');
  }

  message(): Locator {
    return this.main.getByRole('paragraph').filter({ hasNotText: /^(Error|You’re offline)/ });
  }

  link(name: string): Locator {
    return this.main.getByRole('link', { name, exact: true });
  }

  button(name: string): Locator {
    return this.main.getByRole('button', { name, exact: true });
  }

  async tryAgain(): Promise<void> {
    await this.button('Try again').click();
  }

  title(): Promise<string> {
    return this.page.title();
  }

  path(): string {
    return new URL(this.page.url()).pathname;
  }
}
