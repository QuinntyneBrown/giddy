import { Locator, Page } from '@playwright/test';
import { AppShellPage } from './app-shell.page';

/** Signing in with an email and password, or with Google or Apple. */
export class SignInPage extends AppShellPage {
  readonly heading: Locator;
  readonly email: Locator;
  readonly password: Locator;
  readonly keepSignedIn: Locator;
  readonly submit: Locator;
  readonly google: Locator;
  readonly apple: Locator;
  readonly problem: Locator;
  readonly errorSummary: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', { level: 1, name: 'Welcome back!' });
    this.email = page.getByLabel('Email', { exact: true });
    this.password = page.getByLabel('Password', { exact: true });
    this.keepSignedIn = page.getByRole('checkbox', { name: 'Keep me signed in' });
    this.submit = page.locator('main').getByRole('button', { name: 'Sign in' });
    this.google = page.getByRole('link', { name: 'Continue with Google' });
    this.apple = page.getByRole('link', { name: 'Continue with Apple' });
    this.problem = page.locator('main [giddy-alert]');
    this.errorSummary = page.locator('giddy-error-summary');
  }

  async openSignIn(query = ''): Promise<void> {
    await this.open(`/sign-in${query}`);
  }

  async signInWith(email: string, password: string): Promise<void> {
    await this.email.fill(email);
    await this.password.fill(password);
    await this.submit.click();
  }
}
