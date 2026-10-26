import { Locator, Page } from '@playwright/test';
import { AppShellPage } from './app-shell.page';

/** Creating an account. */
export class SignUpPage extends AppShellPage {
  readonly heading: Locator;
  readonly firstName: Locator;
  readonly email: Locator;
  readonly password: Locator;
  readonly postalCode: Locator;
  readonly marketing: Locator;
  readonly submit: Locator;
  readonly errorSummary: Locator;
  readonly problem: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', { level: 1, name: 'Let’s plan something amazing' });
    this.firstName = page.getByLabel('First name');
    this.email = page.getByLabel('Email', { exact: true });
    this.password = page.getByLabel('Password');
    this.postalCode = page.getByLabel('Postal code');
    this.marketing = page.getByRole('checkbox', { name: /Send me party ideas/ });
    this.submit = page.getByRole('button', { name: 'Create my account' });
    this.errorSummary = page.locator('giddy-error-summary');
    this.problem = page.locator('main [giddy-alert]');
  }

  async openSignUp(): Promise<void> {
    await this.open('/sign-up');
  }

  async fill(details: {
    firstName?: string;
    email?: string;
    password?: string;
    postalCode?: string;
  }) {
    if (details.firstName !== undefined) await this.firstName.fill(details.firstName);
    if (details.email !== undefined) await this.email.fill(details.email);
    if (details.password !== undefined) await this.password.fill(details.password);
    if (details.postalCode !== undefined) await this.postalCode.fill(details.postalCode);
  }
}
