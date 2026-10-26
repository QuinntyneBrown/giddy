import { Locator, Page } from '@playwright/test';
import { AppShellPage } from './app-shell.page';

/** Family setup after signing up. */
export class WelcomePage extends AppShellPage {
  readonly heading: Locator;
  readonly addChild: Locator;
  readonly children: Locator;
  readonly skip: Locator;
  readonly done: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', { level: 1, name: 'Who are we celebrating?' });
    this.addChild = page.locator('main').getByRole('button', { name: /^Add (a|another) child$/ });
    this.children = page.getByRole('list', { name: 'Your kids' }).getByRole('listitem');
    this.skip = page.getByRole('link', { name: 'Skip for now' });
    this.done = page.getByRole('link', { name: 'Go to my home' });
  }

  async openWelcome(): Promise<void> {
    await this.open('/welcome');
  }
}
