import { Locator, Page } from '@playwright/test';
import { AppShellPage } from './app-shell.page';

/** The read-only summary anyone with the view-only link sees. */
export class SharedPage extends AppShellPage {
  readonly heading: Locator;
  readonly summary: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', { level: 1 });
    this.summary = page.locator('main');
  }

  async openShared(token: string): Promise<void> {
    await this.open(`/shared/${token}`);
  }

  async openJoin(token: string): Promise<void> {
    await this.open(`/join/${token}`);
  }
}
