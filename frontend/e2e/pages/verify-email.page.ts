import { Locator, Page } from '@playwright/test';
import { AppShellPage } from './app-shell.page';

/** Checking the inbox, and opening the confirmation link. */
export class VerifyEmailPage extends AppShellPage {
  readonly heading: Locator;
  readonly resend: Locator;
  readonly status: Locator;
  readonly setUpFamily: Locator;
  readonly sendNewLink: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', { level: 1 });
    this.resend = page.getByRole('button', { name: 'Resend' });
    this.status = page.locator('main [role="status"]');
    this.setUpFamily = page.getByRole('link', { name: 'Set up my family' });
    this.sendNewLink = page.getByRole('button', { name: 'Send a new link' });
  }

  async openLink(token: string): Promise<void> {
    await this.open(`/verify-email?token=${token}`);
  }
}
