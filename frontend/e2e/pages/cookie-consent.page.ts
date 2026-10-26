import { Locator, Page } from '@playwright/test';

/** The cookie consent bar, the toast that follows, and the choice on Terms & privacy. */
export class CookieConsent {
  readonly bar: Locator;
  readonly essentialOnly: Locator;
  readonly allowAll: Locator;
  readonly choose: Locator;
  readonly saved: Locator;
  readonly legalHeading: Locator;
  readonly choiceOnLegal: Locator;
  readonly saveChoice: Locator;

  constructor(page: Page) {
    this.bar = page.getByRole('region', { name: 'A few cookies, no crumbs' });
    this.essentialOnly = this.bar.getByRole('button', { name: 'Essential only' });
    this.allowAll = this.bar.getByRole('button', { name: 'Allow all' });
    this.choose = this.bar.getByRole('link', { name: 'Choose' });
    this.saved = page.locator('giddy-toast').filter({ hasText: 'Cookie choice saved' });
    this.legalHeading = page.getByRole('heading', { level: 1, name: 'Terms & privacy' });
    this.choiceOnLegal = page.getByRole('group', { name: 'Cookies on this device' });
    this.saveChoice = page.getByRole('button', { name: 'Save cookie choice' });
  }

  option(name: 'Essential only' | 'Allow all'): Locator {
    return this.choiceOnLegal.getByRole('radio', { name });
  }
}
