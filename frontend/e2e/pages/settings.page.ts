import { Locator, Page } from '@playwright/test';
import { AppShellPage } from './app-shell.page';

export class SettingsPage extends AppShellPage {
  readonly memories: Locator;
  readonly signOut: Locator;
  readonly firstName: Locator;
  readonly lastName: Locator;
  readonly mobile: Locator;
  readonly postalCode: Locator;
  readonly save: Locator;
  readonly changeEmail: Locator;
  readonly quietHours: Locator;
  readonly channels: Locator;
  readonly download: Locator;
  readonly deleteAccount: Locator;
  readonly status: Locator;
  readonly errorSummary: Locator;

  constructor(page: Page) {
    super(page);
    this.memories = page.getByRole('region', { name: 'What Giddy remembers' });
    this.signOut = page.locator('main').getByRole('button', { name: 'Sign out' });
    this.firstName = page.getByLabel('First name');
    this.lastName = page.getByLabel('Last name');
    this.mobile = page.getByLabel('Mobile', { exact: true });
    this.postalCode = page.getByLabel('Postal code');
    this.save = page.getByRole('button', { name: 'Save changes' });
    this.changeEmail = page.getByRole('button', { name: 'Change email' });
    this.quietHours = page.getByRole('switch', { name: /Quiet hours/ });
    this.channels = page.getByRole('table', { name: 'Notification channels' });
    this.download = page.getByRole('button', { name: 'Download my data' });
    this.deleteAccount = page.getByRole('button', { name: 'Delete my account' });
    this.status = page.locator('main [giddy-alert][role="status"]');
    this.errorSummary = page.locator('main giddy-error-summary');
  }

  async openSettings(): Promise<void> {
    await this.open('/settings');
  }

  channel(name: string): Locator {
    return this.channels.getByRole('checkbox', { name });
  }

  memory(text: string): Locator {
    return this.memories.locator('.chip').filter({ hasText: text });
  }

  async forget(text: string): Promise<void> {
    await this.memories.getByRole('button', { name: `Forget: ${text}` }).click();
  }
}
