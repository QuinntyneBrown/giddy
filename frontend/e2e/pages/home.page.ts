import { Locator, Page } from '@playwright/test';
import { AppShellPage } from './app-shell.page';

export class HomePage extends AppShellPage {
  readonly greeting: Locator;
  readonly loading: Locator;
  readonly nextParty: Locator;
  readonly countdown: Locator;
  readonly error: Locator;
  readonly firstPartyInvite: Locator;

  constructor(page: Page) {
    super(page);
    this.greeting = page.getByRole('heading', { level: 1 });
    this.loading = page.locator('[aria-busy="true"]');
    this.nextParty = page.getByRole('region', { name: /./ }).filter({ hasText: 'Next up' });
    this.countdown = this.nextParty.locator('.countdown');
    this.error = page.getByRole('alert');
    this.firstPartyInvite = page.getByRole('region', { name: 'Who’s the next birthday star?' });
  }

  partyName(name: string): Locator {
    return this.nextParty.getByRole('heading', { level: 2, name });
  }

  partyWhen(): Locator {
    return this.nextParty.locator('time');
  }

  link(name: string): Locator {
    return this.main.getByRole('link', { name, exact: true });
  }

  async tryAgain(): Promise<void> {
    await this.error.getByRole('button', { name: 'Try again' }).click();
  }
}
