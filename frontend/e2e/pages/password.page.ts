import { Locator, Page } from '@playwright/test';
import { AppShellPage } from './app-shell.page';

/** Asking for a reset link and choosing a new password. */
export class PasswordPage extends AppShellPage {
  readonly heading: Locator;
  readonly email: Locator;
  readonly sendLink: Locator;
  readonly newPassword: Locator;
  readonly confirm: Locator;
  readonly save: Locator;
  readonly problem: Locator;
  readonly backToPlanning: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', { level: 1 });
    this.email = page.getByLabel('Email', { exact: true });
    this.sendLink = page.getByRole('button', { name: 'Email me a reset link' });
    this.newPassword = page.getByLabel('New password', { exact: true });
    this.confirm = page.getByLabel('Confirm new password');
    this.save = page.getByRole('button', { name: 'Save new password' });
    this.problem = page.locator('main [giddy-alert]');
    this.backToPlanning = page.getByRole('link', { name: 'Back to planning' });
  }

  async openForgot(): Promise<void> {
    await this.open('/forgot-password');
  }

  async openReset(token: string): Promise<void> {
    await this.open(`/reset-password?token=${token}`);
  }
}
