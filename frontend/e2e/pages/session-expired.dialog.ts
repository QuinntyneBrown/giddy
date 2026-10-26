import { Locator, Page } from '@playwright/test';

/** "Still there?": signing back in without losing what was being done. */
export class SessionExpiredDialog {
  readonly dialog: Locator;
  readonly email: Locator;
  readonly password: Locator;
  readonly signBackIn: Locator;

  constructor(page: Page) {
    this.dialog = page.getByRole('dialog', { name: /^Still there/ });
    this.email = this.dialog.getByLabel('Email');
    this.password = this.dialog.getByLabel('Password');
    this.signBackIn = this.dialog.getByRole('button', { name: 'Sign back in' });
  }
}
