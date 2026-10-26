import { Locator, Page } from '@playwright/test';
import { AppShellPage } from './app-shell.page';

export class SettingsPage extends AppShellPage {
  readonly memories: Locator;
  readonly signOut: Locator;

  constructor(page: Page) {
    super(page);
    this.memories = page.getByRole('region', { name: 'What Giddy remembers' });
    this.signOut = page.locator('main').getByRole('button', { name: 'Sign out' });
  }

  async openSettings(): Promise<void> {
    await this.open('/settings');
  }

  memory(text: string): Locator {
    return this.memories.locator('.chip').filter({ hasText: text });
  }

  async forget(text: string): Promise<void> {
    await this.memories.getByRole('button', { name: `Forget: ${text}` }).click();
  }
}
